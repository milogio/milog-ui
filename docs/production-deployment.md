# UI production deployment: FullHost Value 2

This runbook targets one Ubuntu Server 26.04 LTS UI VM with 1 CPU core, 2 GB RAM, and 25 GB disk. The Laravel API runs on a separate VM at `https://api.milog.ca`. Build the standalone image in CI or on a build machine; the UI VM only pulls and runs it. The public UI hostname remains an input throughout this guide.

## Inputs and gates

- Choose the final UI hostname and public HTTPS origin (`https://<chosen-hostname>`). Create its A record and, only if IPv6 is configured and reachable, its AAAA record pointing to the UI VM. Ensure port 80 and 443 reach host Caddy; keep port 3000 closed externally. Allow outbound HTTPS to `api.milog.ca` and the image registry.
- Confirm the VM architecture (`uname -m`) and build a matching image platform. Arrange registry read access on the UI VM and push access in CI. Record the previous compatible image digest for rollback.
- Deploy the API first: migrations, tenant-bound auth, signup/verification, entitlement, and timeline contract must be present. Verify `https://api.milog.ca` TLS and API behavior. Set the API VM's `MILOG_UI_URL` to **exactly the chosen UI origin** before enabling signup so email links point to this host.
- Keep production `MILOG_TERMS_URL` empty until the API, outbound SMTP, SPF/DKIM/DMARC, verification flow, and log-safety checks pass. Billing checkout and paid-key creation remain disabled.

## Build and publish off-host

Run the repository checks and build on CI or a build machine with enough memory. The existing Dockerfile creates Next.js standalone output and runs it as UID 1001. Use a registry reachable from the UI VM:

```bash
npm ci
npm run check
IMAGE_REPOSITORY=registry.example.com/your-org/milog-ui
RELEASE=your-immutable-release-id
PLATFORM=linux/amd64 # Use linux/arm64 instead if uname -m on the VM is aarch64.
docker buildx build --platform "$PLATFORM" --tag "$IMAGE_REPOSITORY:$RELEASE" --push .
docker buildx imagetools inspect "$IMAGE_REPOSITORY:$RELEASE"
```

Copy the pushed manifest's `sha256:` digest from the inspection result. Keep the repository and 64-character digest in `.env.production`; the Compose image expression joins them as `repository@sha256:digest`. A release tag is useful for humans but must not replace the digest pin. Do not run `docker compose build` or `up --build` on the 2 GB VM.

## Prepare the UI VM

Install Docker Engine with the [official Ubuntu instructions](https://docs.docker.com/engine/install/ubuntu/) and the Compose plugin. Install host Caddy from its [official Debian/Ubuntu repository](https://caddyserver.com/docs/install):

```bash
sudo apt install --yes debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo apt update
sudo apt install --yes caddy
```

Deploy only `compose.production.yaml` and a private `.env.production` from [.env.production.example](../.env.production.example). Use a deployment directory readable by the Docker operator, `umask 077`, and file mode `0600`. Do not commit or copy the populated file into an image. Set `MILOG_UI_REPOSITORY`, `MILOG_UI_DIGEST`, and `MILOG_UI_ORIGIN`; set `MILOG_SESSION_SECRET` to one independently generated, persistent base64 value from at least 48 random bytes (for example, `openssl rand -base64 48` in a private terminal). Store it in a secret manager or protected backup. Reuse the same value for upgrades and rollbacks; rotating it logs out every UI session. Do not put it in shell history, Compose command arguments, or `NEXT_PUBLIC_*` variables. Compose fixes server-only `MILOG_API_URL=https://api.milog.ca`; there is no shared Docker network or host-gateway API address.

The production service uses a 768 MB memory limit, a 512 MB Node heap, 0.85 CPU, a 128-process limit, and 30 MB maximum rotated Docker logs. Leave headroom for Ubuntu, Docker, and Caddy; monitor memory and disk before changing these limits. The container health check probes `/api/health`, which reports 200 only when runtime configuration is valid and the API responds below 500 (an expected unauthenticated 401 counts as reachable).

## Configure host Caddy

Copy [Caddyfile.production.example](../deploy/Caddyfile.production.example) to `/etc/caddy/Caddyfile` and replace `ui.example.com` with the chosen hostname. The site address lets Caddy obtain and renew public TLS certificates. Caddy forwards the original Host and sets its own `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` from the direct connection; it removes other forwarding headers. Do not configure trusted client proxies without an explicit, verified proxy topology. The UI only listens on Docker's host loopback port.

Create the access-log directory for the packaged `caddy` service account before validating the config:

```bash
sudo install -d -o caddy -g caddy -m 0750 /var/log/caddy
```

The Caddy access log stores the **path but no query string or request/response headers**, so verification tokens, passwords, cookies, bearer tokens, and one-time API keys are absent. Caddy's unstructured runtime/error logger is disabled because it cannot be guaranteed to omit arbitrary request URLs; failed requests remain visible by status in the filtered access log. Do not enable debug logs, body logging, credential logging, external analytics, or a second reverse-proxy log without an equivalent redaction review. The application does not log request bodies or credentials. Docker rotates the standalone server's stdout/stderr. Review any separate load balancer, CDN, API proxy, APM, and error collector independently before signup is enabled.

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy
```

## Pull and start

From the UI deployment directory, with the real `.env.production` in place:

```bash
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml pull ui
docker compose --env-file .env.production -f compose.production.yaml up -d --no-build ui
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --tail=100 ui
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
```

`config --quiet` checks Compose interpolation without printing the secret. `restart: unless-stopped` and Docker's enabled system service restore the container after reboot. Check `docker system df` and available disk after each release; retain the known-good prior image until rollback is no longer needed.

## Validate through the public origin

- Confirm HTTPS and `GET /api/health` return 200 at the chosen UI origin. Check that `/verify-email` returns `Referrer-Policy: no-referrer` and `Cache-Control: no-store`, and that port 3000 is not publicly reachable.
- From a machine with this repository, run `npm run smoke` with `MILOG_SMOKE_ORIGIN` set to the exact public origin and a dedicated low-privilege account with more than one cursor page. Provide `MILOG_SMOKE_EMAIL`, `MILOG_SMOKE_PASSWORD`, and optional `MILOG_SMOKE_TENANT_ID` through a private environment or secret manager, without echoing the password. The smoke script checks encrypted HTTP-only **Secure** cookie issuance, session restore, pagination, tenant isolation, and logout.
- Send a request with a harmless sentinel query value (for example `/verify-email?token=LOG_REDACTION_SENTINEL`) and verify the sentinel is absent from `/var/log/caddy/milog-ui-access.json`, `journalctl -u caddy`, and container logs. Confirm the access log records only `/verify-email`. Exercise an upstream failure as well and check error handling. Inspect browser/network logs, API proxy logs, and any external logging/analytics layer for passwords, cookies, bearer tokens, verification tokens, and raw API keys.
- Verify a forged `X-Forwarded-Proto` or `X-Forwarded-Host` from a client cannot alter the session cookie's Secure attribute or the configured mutation origin check. Confirm login, timeline, signup-disabled behavior, and Caddy TLS renewal readiness.
- Reboot the UI VM once during the release window. Confirm Caddy and Docker services start, the container returns healthy, the public health check succeeds, and sessions survive because the secret is persistent.

After all signup gates pass, set `MILOG_TERMS_URL=/terms` in `.env.production`, recreate the UI container with `up -d --no-build --force-recreate ui`, and exercise signup, email delivery, verification, login, temporary-key creation/use/revocation, and log-safety checks. Keep paid billing disabled.

## Rollback

Keep the previous UI image repository and digest. Restore those two values in `.env.production`, then `pull ui` and `up -d --no-build --force-recreate ui` with the commands above. Keep `MILOG_UI_ORIGIN` and `MILOG_SESSION_SECRET` unchanged. Run the public health and smoke tests again. The API must remain compatible with both UI versions; do not roll it below tenant-bound auth or cursor support while either UI version is live. Roll back API migrations only under the API's separate procedure. Do not delete the previous image until the new release is accepted.
