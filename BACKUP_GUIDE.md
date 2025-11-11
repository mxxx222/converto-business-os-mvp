# 🔒 Converto™ Backup & Data Health Guide

## Overview

Converto Business OS includes **automated backup** and **data health monitoring** to ensure your business data is always safe and recoverable.

---

## 📦 Automatic Backups

### What Gets Backed Up

Every backup includes:
- **Database dump** (PostgreSQL or SQLite)
- **File storage** (receipts, documents, images)
- **Metadata** (backup date, version, engine info)

### Backup Schedule

**Default:** Every night at **02:10 (Europe/Helsinki)**

Backups are stored as ZIP files:
```
backups/
  converto-backup-20251013-021015.zip
  converto-backup-20251014-021012.zip
  ...
```

### Retention Policy

**Default:** Keep backups for **14 days**

Older backups are automatically deleted.

---

## 🛠️ Manual Backup

### Via Dashboard

1. Go to **Dashboard**
2. Find **Data Health** card
3. Click **"💾 Ota varmuuskopio nyt"**
4. Wait for confirmation

### Via API

```bash
curl -X POST http://localhost:8000/api/v1/standalone/backup/run
```

### Via Command Line

```bash
cd /path/to/converto
./scripts/cron_backup.sh
```

---

## 💾 Backup Storage

### Local (Development)

```env
BACKUP_DIR=./backups
STORAGE_DIR=./storage
BACKUP_RETENTION_DAYS=14
```

### Production (Render)

1. Create **Persistent Disk** (e.g., `/backups`)
2. Set environment variables:
   ```env
   BACKUP_DIR=/backups
   STORAGE_DIR=/storage
   BACKUP_RETENTION_DAYS=30
   ```
3. Create **Cron Job**:
   - Command: `bash -lc "./scripts/cron_backup.sh"`
   - Schedule: `10 2 * * *`

### Cloud Storage (Optional)

Add `rclone` upload to backup script:

```bash
# At end of cron_backup.sh
if command -v rclone &> /dev/null; then
  rclone copy "$ZIP" s3:converto-backups/
  echo "☁️  Uploaded to cloud storage"
fi
```

---

## 📊 Data Health Monitoring

### Dashboard Card

The **Data Health** card shows:
- **Status badge** (OK / WARN / ERROR)
- **Metrics**: Receipts, Invoices, Legal rules, Gamify events
- **Last backup**: Time and size
- **Warnings**: Missing backups, old backups, empty data

### Health API

```bash
# Check health
curl http://localhost:8000/api/v1/standalone/health

# Response:
{
  "status": "ok",
  "metrics": {
    "receipts": 42,
    "invoices": 15,
    "legal_rules": 8,
    "gamify_events": 127
  },
  "last_backup": {
    "exists": true,
    "file": "converto-backup-20251013-021015.zip",
    "size_mb": 12.5,
    "age_hours": 8.2
  },
  "notes": [],
  "checked_at": "2025-10-13T10:15:30Z"
}
```

### Health Warnings

| Warning | Trigger | Action |
|---------|---------|--------|
| ⚠️ No backups | No backup files found | Run first backup |
| ⚠️ Old backup | Last backup >36h old | Check cron job |
| 💡 No data | Zero receipts/invoices | Start using the system |

---

## 🔄 Data Export & Import

### Full Export

**Export all data** (database + files + metadata):

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/standalone/export/tenant_demo

# Download
curl -O http://localhost:8000/api/v1/standalone/download/tenant_demo_export_20251013.zip
```

**Export includes:**
- `database.sql` - Full database dump
- `files.tar.gz` - All uploaded files
- `meta.json` - Export metadata
- `calendar.ics` - Reminders/deadlines
- `reports/` - VAT reports (CSV/HTML)

### Data Import

**Import from export ZIP** (dry-run first):

```bash
# Dry-run (validate only)
curl -X POST http://localhost:8000/api/v1/standalone/import/tenant_new \
  -F "file=@export.zip" \
  -F "dry_run=true"

# Actual import
curl -X POST http://localhost:8000/api/v1/standalone/import/tenant_new \
  -F "file=@export.zip" \
  -F "dry_run=false"
```

---

## 🔐 Security

### Backup Encryption (Optional)

Add encryption to backup script:

```bash
# After creating ZIP
if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
  gpg --symmetric --cipher-algo AES256 --passphrase "$BACKUP_ENCRYPTION_KEY" "$ZIP"
  rm "$ZIP"
  ZIP="$ZIP.gpg"
fi
```

### Access Control

- Backup API requires **admin authentication**
- Backup files are **not publicly accessible**
- Use **secure file permissions** (600 for backups)

---

## 🧪 Testing Backups

### Test Backup Creation

```bash
# 1. Create test backup
./scripts/cron_backup.sh

# 2. Verify ZIP exists
ls -lh backups/converto-backup-*.zip

# 3. Test ZIP integrity
unzip -t backups/converto-backup-*.zip

# 4. Check health API
curl http://localhost:8000/api/v1/standalone/health
```

### Test Restore (Dry-Run)

```bash
# 1. Export current data
curl -X POST http://localhost:8000/api/v1/standalone/export/tenant_demo

# 2. Import (dry-run)
curl -X POST http://localhost:8000/api/v1/standalone/import/tenant_test \
  -F "file=@tenant_demo_export_*.zip" \
  -F "dry_run=true"

# 3. Check report
```

---

## 📋 Troubleshooting

### Backup Not Running

**Check cron:**
```bash
crontab -l
```

**Check logs:**
```bash
tail -f /tmp/converto_backup.log
```

**Run manually:**
```bash
./scripts/cron_backup.sh
```

### Backup Too Large

**Exclude old files:**
```bash
# In cron_backup.sh, before tar:
find "$STORAGE_DIR" -type f -mtime +365 -delete
```

**Compress better:**
```bash
# Use gzip level 9
tar -C "$STORAGE_DIR" -czvf "$BK_DIR/tmp/storage-$TS.tgz" --best .
```

### Missing pg_dump

**Install PostgreSQL client:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Render (add to Dockerfile)
RUN apt-get update && apt-get install -y postgresql-client
```

---

## 🎯 Best Practices

1. **Test restores regularly** (monthly)
2. **Store backups off-site** (S3/R2)
3. **Monitor backup age** (<24h)
4. **Keep 30+ days** for production
5. **Encrypt sensitive data**
6. **Document restore procedures**
7. **Automate health checks**

---

## 📞 Support

If backups fail or data health shows errors:

1. Check logs: `/tmp/converto_backup.log`
2. Verify permissions: `ls -la backups/`
3. Test manually: `./scripts/cron_backup.sh`
4. Contact support: support@converto.fi

---

**🔒 Your data is safe with Converto™**
