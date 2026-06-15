     1|const http = require('http');
     2|const https = require('https');
     3|const fs = require('fs');
     4|const path = require('path');
     5|
     6|const supabase = require('./supabase.cjs');
     7|const crm = require('./crm.cjs');
     8|
     9|const ADMIN_PASS = 'admin123'; // Simple local-only auth
    10|