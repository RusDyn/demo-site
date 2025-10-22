# Production Incident Response: $ARGUMENTS

IMMEDIATE INCIDENT RESPONSE MODE ACTIVATED. I will help you resolve this production issue quickly and systematically.

## 1. First, let me understand the situation

Tell me:
- What symptoms are users experiencing?
- When did this start?
- What is the scope/impact?
- Any recent deployments or changes?

## 2. Immediate Mitigation

Based on the symptoms, I'll help you:
- Identify quick mitigation options (rollback, feature flags, scaling)
- Execute emergency procedures
- Communicate status updates

## 3. Root Cause Investigation

I'll systematically:
- Check recent commits: `git log --oneline -20`
- Review application logs for errors
- Analyze metrics for anomalies
- Identify what changed

## 4. Available Emergency Commands

```bash
# Rollback to previous deployment
npm run deploy:rollback

# Disable feature flags
npm run flags:disable -- FEATURE_NAME

# Clear caches
npm run cache:clear

# Emergency configuration
npm run emergency:config

# Scale up resources
npm run scale:emergency
```

## 5. Fix Implementation

Once we identify the issue, I'll:
- Create a minimal fix
- Test the fix locally
- Deploy with monitoring
- Verify resolution

## 6. Documentation

I'll help document:
- Timeline of events
- Actions taken
- Root cause
- Prevention measures

**IMPORTANT**: 
- User impact first, root cause second
- Small, safe changes only
- Test everything before deploying
- Document as we go

What's the current situation? Describe the symptoms and I'll help immediately.