# Using Custom User/Group IDs

HA Theme Studio runs as a non-root user for security. By default, it uses **UID:GID 1000:1000**.

**Volume permissions are handled automatically!** The container starts as root, fixes ownership of `/framework` and `/output`, then drops to the non-root user. No manual `chown` required! 🎉

## Default Usage

```bash
# Copy the sample compose file
cp docker-compose.yaml-sample docker-compose.yaml

# Build and run (uses default 1000:1000)
docker compose up -d

# Permissions are automatically configured - just wait for startup!
```

## Custom User/Group ID

### Option 1: Build-time Configuration (Recommended)

Edit `docker-compose.yaml`:

```yaml
services:
  theme-studio:
    build:
      context: .
      args:
        USER_ID: 1001    # Your user ID
        GROUP_ID: 1001   # Your group ID
```

Then rebuild:

```bash
docker compose build
docker compose up -d
```

### Option 2: Runtime Override

Edit `docker-compose.yaml`:

```yaml
services:
  theme-studio:
    user: "1001:1001"  # Your UID:GID
```

Then restart:

```bash
docker compose up -d
```

## Finding Your User/Group ID

On Linux/macOS:

```bash
id -u  # Shows your user ID
id -g  # Shows your group ID
```

On Windows with WSL:

```bash
wsl id -u
wsl id -g
```

## Why This Matters

Running as non-root:
- ✅ Better security (principle of least privilege)
- ✅ Files created in volumes match your user ID
- ✅ No permission issues when editing framework files
- ✅ Follows Docker best practices

## File Permissions

The container **automatically** fixes permissions on startup:
- `/framework` - For reading/writing theme framework files
- `/output` - For writing generated theme files

The entrypoint script (running as root) ensures these directories have the correct ownership before dropping to the app user.

## Verification

Check the container is running as the correct user:

```bash
docker exec ha-theme-studio id
# Should show: uid=1000(appuser) gid=1000(appuser)

# Or your custom user
# uid=1001(appuser) gid=1001(appuser)
```

## Troubleshooting

### "Permission denied" errors

This should no longer happen since permissions are auto-fixed on startup. If you still see issues:

1. Check container logs:
   ```bash
   docker compose logs
   # Look for "Setting up volume directories..." message
   ```

2. Restart the container to re-run permission fixes:
   ```bash
   docker compose restart
   ```

3. If using custom UID/GID, verify it's set correctly:
   ```bash
   docker exec ha-theme-studio env | grep APP_USER
   # Should show APP_USER_ID and APP_GROUP_ID
   ```

### Container won't start

Check logs:
```bash
docker compose logs theme-studio
```

Common issues:
- Volume mount permission denied → Fix ownership
- Build script fails → Check USER_ID/GROUP_ID are valid numbers
