#!/bin/bash
cd "$(dirname "$0")"
open "http://localhost:8000"
python3 -m http.server 8000
