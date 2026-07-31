# Knowledge Base Verification Tests - RemoteFix

## Purpose
Verify that all files under `knowledge/` contain the mandatory 9 metadata headers and are free of empty sections.

## Input
Path: `.agents/knowledge/`

## Expected Result
All documents successfully parse and contain required sections with non-empty content.

## Failure Mode
A file lacks a required section, or a section contains generic placeholder text.
