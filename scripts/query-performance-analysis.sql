-- =====================================================
-- Trivexa Query Performance Analysis Script
-- =====================================================
-- Purpose: Detect slow queries, analyze performance, suggest optimizations
-- Usage: psql -U trivexa_user -d trivexa -f query-performance-analysis.sql
--
-- Sections:
-- 1. Slow Query Detection
-- 2. Index Usage Analysis
-- 3. Table Statistics
-- 4. Missing Index Recommendations
-- 5. Query Performance Metrics
-- =====================================================

\echo '============================================'
\echo 'TRIVEXA QUERY PERFORMANCE ANALYSIS'
\echo 'Generated:' `date`
\echo '============================================'
\echo ''

-- =====================================================
-- 1. SLOW QUERY DETECTION
-- =====================================================
\echo '1. TOP 10 SLOWEST QUERIES (requires pg_stat_statements)'
\echo '---------------------------------------------------'

-- Enable timing
\timing on

-- Check if pg_stat_statements is available
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
) as pg_stat_statements_installed;

\echo ''
\echo 'If FALSE above, enable with: CREATE EXTENSION pg_stat_statements;'
\echo ''

-- Top 10 slowest queries by average execution time
SELECT
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  calls,
  ROUND((mean_exec_time * calls)::numeric, 2) as total_impact,
  LEFT(query, 100) as query_preview
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_sleep%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''

-- =====================================================
-- 2. INDEX USAGE ANALYSIS
-- =====================================================
\echo '2. UNUSED INDEXES (Candidates for Removal)'
\echo '---------------------------------------------------'

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

\echo ''
\echo '3. INDEX CACHE HIT RATE (Should be > 99%)'
\echo '---------------------------------------------------'

SELECT
  'index hit rate' as metric,
  ROUND(
    (sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100,
    2
  ) as percentage
FROM pg_statio_user_indexes;

\echo ''

-- =====================================================
-- 3. TABLE STATISTICS
-- =====================================================
\echo '4. TABLE SIZE AND BLOAT'
\echo '---------------------------------------------------'

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  CASE
    WHEN n_live_tup > 0
    THEN ROUND((n_dead_tup * 100.0 / (n_live_tup + n_dead_tup))::numeric, 2)
    ELSE 0
  END as dead_percentage
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 15;

\echo ''
\echo 'NOTE: Tables with > 20% dead rows should be VACUUMed'
\echo ''

-- =====================================================
-- 4. MISSING INDEX RECOMMENDATIONS
-- =====================================================
\echo '5. SEQUENTIAL SCANS ON LARGE TABLES'
\echo '---------------------------------------------------'
\echo '(These might benefit from indexes)'
\echo ''

SELECT
  schemaname,
  relname as table_name,
  seq_scan as sequential_scans,
  idx_scan as index_scans,
  n_live_tup as rows,
  pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) as table_size,
  CASE
    WHEN seq_scan > 0 AND idx_scan > 0
    THEN ROUND((seq_scan * 100.0 / (seq_scan + idx_scan))::numeric, 2)
    WHEN seq_scan > 0 AND idx_scan = 0
    THEN 100.0
    ELSE 0
  END as seq_scan_percentage
FROM pg_stat_user_tables
WHERE n_live_tup > 1000 -- Only tables with > 1000 rows
  AND seq_scan > 100 -- Significant sequential scans
ORDER BY seq_scan DESC, n_live_tup DESC
LIMIT 10;

\echo ''

-- =====================================================
-- 6. CACHE HIT RATIOS
-- =====================================================
\echo '6. CACHE HIT RATIOS (Should be > 99%)'
\echo '---------------------------------------------------'

SELECT
  'cache hit rate' as metric,
  ROUND(
    sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100,
    2
  ) as percentage
FROM pg_statio_user_tables;

\echo ''

-- =====================================================
-- 7. TABLE VACUUM STATUS
-- =====================================================
\echo '7. VACUUM STATUS'
\echo '---------------------------------------------------'

SELECT
  schemaname,
  relname as table_name,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  vacuum_count,
  autovacuum_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY last_autovacuum DESC NULLS LAST
LIMIT 15;

\echo ''

-- =====================================================
-- 8. LONG-RUNNING QUERIES
-- =====================================================
\echo '8. CURRENTLY RUNNING QUERIES (Active > 5s)'
\echo '---------------------------------------------------'

SELECT
  pid,
  now() - query_start AS duration,
  state,
  LEFT(query, 80) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
  AND (now() - query_start) > interval '5 seconds'
ORDER BY duration DESC;

\echo ''

-- =====================================================
-- 9. CONNECTION STATISTICS
-- =====================================================
\echo '9. DATABASE CONNECTIONS'
\echo '---------------------------------------------------'

SELECT
  datname as database,
  count(*) as connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname
ORDER BY connections DESC;

\echo ''

-- =====================================================
-- 10. INDEX BLOAT ESTIMATION
-- =====================================================
\echo '10. INDEX BLOAT ESTIMATION'
\echo '---------------------------------------------------'

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE
    WHEN idx_scan > 0
    THEN ROUND((idx_tup_read::numeric / idx_scan), 2)
    ELSE 0
  END as avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 1000000 -- > 1MB
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;

\echo ''

-- =====================================================
-- 11. RECOMMENDATIONS SUMMARY
-- =====================================================
\echo '11. OPTIMIZATION RECOMMENDATIONS'
\echo '---------------------------------------------------'
\echo ''
\echo 'Based on the analysis above, consider:'
\echo ''
\echo '1. VACUUM tables with > 20% dead rows'
\echo '   Command: VACUUM ANALYZE table_name;'
\echo ''
\echo '2. Add indexes to tables with high sequential scan ratios'
\echo '   Review query patterns and add appropriate indexes'
\echo ''
\echo '3. Remove unused indexes (idx_scan = 0)'
\echo '   Command: DROP INDEX IF EXISTS index_name;'
\echo ''
\echo '4. If cache hit rate < 99%:'
\echo '   - Increase shared_buffers (PostgreSQL config)'
\echo '   - Add more system RAM'
\echo ''
\echo '5. Review slow queries (> 100ms average)'
\echo '   Use EXPLAIN ANALYZE to understand execution plans'
\echo ''
\echo '6. Monitor connection pool usage'
\echo '   Ensure connections are properly released'
\echo ''

-- =====================================================
-- 12. EXPLAIN ANALYZE TEMPLATE
-- =====================================================
\echo '12. EXPLAIN ANALYZE TEMPLATE'
\echo '---------------------------------------------------'
\echo ''
\echo 'To analyze a specific slow query, use:'
\echo ''
\echo 'EXPLAIN (ANALYZE, BUFFERS, VERBOSE)'
\echo 'SELECT ... FROM ... WHERE ...;'
\echo ''
\echo 'Look for:'
\echo '  - Seq Scan on large tables (add indexes)'
\echo '  - High execution time nodes'
\echo '  - Index Scan with high "Rows Removed by Filter"'
\echo '  - Nested Loop with high iterations'
\echo ''

\echo '============================================'
\echo 'ANALYSIS COMPLETE'
\echo '============================================'

-- Turn off timing
\timing off
