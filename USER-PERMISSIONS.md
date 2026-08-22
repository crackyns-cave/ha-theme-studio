# Using Custom User/Group IDs

HA Theme Studio runs as a non-root user for security. By default, it uses **UID:GID 1000:1000**.

## Default Usage

```bash
# Copy the sample compose file
cp docker-compose.yaml-sample docker-compose.yaml

# Build and run (uses default 1000:1000)
docker compose up -d
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

The container user needs read/write access to:
- `/framework` - For reading/writing theme framework files
- `/output` - For writing generated theme files

If you get permission errors, ensure the mounted directories have the correct ownership:

```bash
# Set ownership to match container user (default 1000:1000)
sudo chown -R 1000:1000 framework/ output/

# Or match your custom user
sudo chown -R 1001:1001 framework/ output/
```

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

1. Check directory ownership:
   ```bash
   ls -la framework/ output/
   ```

2. Fix permissions:
   ```bash
   sudo chown -R 1000:1000 framework/ output/
   # Or your custom UID:GID
   ```

3. Rebuild container with correct user:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

### Container won't start

Check logs:
```bash
docker compose logs theme-studio
```

Common issues:
- Volume mount permission denied → Fix ownership
- Build script fails → Check USER_ID/GROUP_ID are valid numbers
