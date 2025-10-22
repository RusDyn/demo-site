# Performance Optimization: $ARGUMENTS

## Analysis Phase
1. Run performance profiling
2. Identify bottlenecks with data
3. Measure current metrics
4. Set performance targets

## Common Optimizations

### Database
- Add missing indexes
- Optimize N+1 queries
- Use connection pooling
- Implement query result caching

### API
- Implement response caching
- Use pagination for lists
- Add field filtering
- Compress responses

### Frontend
- Lazy load components
- Implement virtual scrolling
- Optimize bundle size
- Use React.memo strategically

## Verification
- Measure improvement
- Run load tests
- Check memory usage
- Verify no regressions

Always measure before and after. No premature optimization.