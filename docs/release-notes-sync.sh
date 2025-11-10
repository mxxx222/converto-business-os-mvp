#!/usr/bin/env bash
# release-notes-sync.sh — annotate release notes for rollback events/audit trail
set -e

INCIDENT_JSON=""
APPEND_ROLLBACK=false
RN_PATH="docs/RELEASE_NOTES_ADMIN_DASHBOARD.md"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --incident)
      INCIDENT_JSON="$2"; shift 2;;
    --append-rollback)
      APPEND_ROLLBACK=true; shift;;
    --rn-path)
      RN_PATH="$2"; shift 2;;
    *) echo "Unknown argument $1"; exit 1;;
  esac
done

if [[ $APPEND_ROLLBACK = true ]]; then
  if [[ ! -f "$INCIDENT_JSON" ]]; then
    echo "Incident JSON not found: $INCIDENT_JSON"; exit 1;
  fi
  if [[ ! -f "$RN_PATH" ]]; then
    echo "Release Notes file not found: $RN_PATH"; exit 1;
  fi
  META=$(jq -r '[.incident_id,.version,.time,.actor] | @tsv' "$INCIDENT_JSON")
  IFS=$'\t' read INCIDENT_ID VERSION TIME ACTOR <<< "$META"
  ANN="\n---\n🔴 **Rollback Event** — Incident: $INCIDENT_ID, Version: $VERSION, Time: $TIME, Actor: $ACTOR\n"
  echo -e "$ANN" >> "$RN_PATH"
  echo "Rollback event annotated to $RN_PATH"
else
  echo "Nothing to do (no operation specified)"
fi
