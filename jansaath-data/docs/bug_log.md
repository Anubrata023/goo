bug_log = """# JanSaath Bug Log

## Severity Levels
- **P1 (Critical)**: App crashes, feature completely broken
- **P2 (Major)**: Feature works but has bugs
- **P3 (Minor)**: UI issues, typos, visual glitches

## Active Bugs

| ID | Severity | Feature | Issue | Steps to Reproduce | Assigned To | Status |
|----|----------|---------|-------|-------------------|-------------|--------|
| BUG-001 | P1 | IVR | Twilio webhook returns 404 | Call Twilio number, hang up | Person A | Open |
| BUG-002 | P2 | Map | Pins not showing on map | Open map page | Person B | Open |
| BUG-003 | P3 | Hindi Toggle | Some text not translated | Toggle to Hindi | Person B | Open |

## Closed Bugs

| ID | Severity | Feature | Issue | Fix |
|----|----------|---------|-------|-----|
| BUG-004 | P3 | Landing Page | Typo in \"Complaint\" | Fixed |

## Testing Checklist

- [ ] Text complaint submission
- [ ] Voice complaint submission
- [ ] Photo complaint submission
- [ ] WhatsApp submission
- [ ] IVR phone call
- [ ] Community feed (real-time)
- [ ] Map heatmap
- [ ] Upvote functionality
- [ ] Admin dashboard
- [ ] Kanban drag-and-drop
- [ ] Insight Panel
- [ ] Draft Proposal generation
- [ ] Public dashboard
- [ ] Hindi toggle
- [ ] Mobile responsive
- [ ] SMS notification
"""

with open("docs/bug_log.md", "w") as f:
    f.write(bug_log)

print("✅ docs/bug_log.md written")
print(bug_log)