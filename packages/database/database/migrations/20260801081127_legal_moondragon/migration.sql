CREATE TABLE [ai_copilot_messages] (
	[id] varchar(36),
	[session_id] varchar(36) NOT NULL,
	[role] varchar(20) NOT NULL,
	[message] text NOT NULL,
	[suggested_actions_json] text,
	[tokens_used] int NOT NULL CONSTRAINT [ai_copilot_messages_tokens_used_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_copilot_messages_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_copilot_messages_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_copilot_sessions] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[user_role] varchar(50) NOT NULL CONSTRAINT [ai_copilot_sessions_user_role_default] DEFAULT ('technician'),
	[session_title] varchar(255) NOT NULL CONSTRAINT [ai_copilot_sessions_session_title_default] DEFAULT ('New AI Copilot Session'),
	[context_json] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_copilot_sessions_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [ai_copilot_sessions_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_copilot_sessions_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_memory_store] (
	[id] varchar(36),
	[memory_type] varchar(50) NOT NULL,
	[memory_key] varchar(255) NOT NULL,
	[memory_value_json] text NOT NULL,
	[tenant_id] varchar(36),
	[expires_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_memory_store_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_memory_store_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_orchestrator_logs] (
	[id] varchar(36),
	[request_type] varchar(50) NOT NULL,
	[provider_used] varchar(50) NOT NULL,
	[model_used] varchar(100) NOT NULL,
	[prompt_version] varchar(20) NOT NULL CONSTRAINT [ai_orchestrator_logs_prompt_version_default] DEFAULT ('v1.0'),
	[prompt_tokens] int NOT NULL CONSTRAINT [ai_orchestrator_logs_prompt_tokens_default] DEFAULT ((0)),
	[completion_tokens] int NOT NULL CONSTRAINT [ai_orchestrator_logs_completion_tokens_default] DEFAULT ((0)),
	[total_tokens] int NOT NULL CONSTRAINT [ai_orchestrator_logs_total_tokens_default] DEFAULT ((0)),
	[latency_ms] int NOT NULL CONSTRAINT [ai_orchestrator_logs_latency_ms_default] DEFAULT ((0)),
	[estimated_cost_usd] varchar(20) NOT NULL CONSTRAINT [ai_orchestrator_logs_estimated_cost_usd_default] DEFAULT ('0.0000'),
	[cache_hit] bit NOT NULL CONSTRAINT [ai_orchestrator_logs_cache_hit_default] DEFAULT ((0)),
	[fallback_used] bit NOT NULL CONSTRAINT [ai_orchestrator_logs_fallback_used_default] DEFAULT ((0)),
	[tools_executed] text,
	[tenant_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_orchestrator_logs_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_orchestrator_logs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_rag_query_logs] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[query_text] varchar(500) NOT NULL,
	[retrieved_doc_count] int NOT NULL CONSTRAINT [ai_rag_query_logs_retrieved_doc_count_default] DEFAULT ((0)),
	[top_doc_title] varchar(255),
	[latency_ms] int NOT NULL CONSTRAINT [ai_rag_query_logs_latency_ms_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_rag_query_logs_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_rag_query_logs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_tool_audit_logs] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[tenant_id] varchar(36),
	[tool_id] varchar(100) NOT NULL,
	[tool_category] varchar(50) NOT NULL,
	[input_parameters_json] text,
	[execution_result_json] text,
	[status] varchar(20) NOT NULL CONSTRAINT [ai_tool_audit_logs_status_default] DEFAULT ('success'),
	[confirmation_required] bit NOT NULL CONSTRAINT [ai_tool_audit_logs_confirmation_required_default] DEFAULT ((0)),
	[confirmed_by_user_id] varchar(36),
	[latency_ms] int NOT NULL CONSTRAINT [ai_tool_audit_logs_latency_ms_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_tool_audit_logs_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_tool_audit_logs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ai_vector_knowledge_store] (
	[id] varchar(36),
	[title] varchar(255) NOT NULL,
	[content] text NOT NULL,
	[category] varchar(50) NOT NULL CONSTRAINT [ai_vector_knowledge_store_category_default] DEFAULT ('general'),
	[tags] varchar(255),
	[embedding_vector_json] text,
	[tenant_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [ai_vector_knowledge_store_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ai_vector_knowledge_store_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [amc_contracts] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[customer_id] varchar(36),
	[contract_number] varchar(50) NOT NULL,
	[title] varchar(255) NOT NULL,
	[device_count] int NOT NULL CONSTRAINT [amc_contracts_device_count_default] DEFAULT ((1)),
	[start_date] varchar(10) NOT NULL,
	[end_date] varchar(10) NOT NULL,
	[contract_amount] decimal(10,2) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [amc_contracts_status_default] DEFAULT ('active'),
	[created_at] datetime2 NOT NULL CONSTRAINT [amc_contracts_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [amc_contracts_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [amc_contracts_pkey] PRIMARY KEY([id]),
	CONSTRAINT [amc_contracts_contract_number_key] UNIQUE([contract_number])
);
--> statement-breakpoint
CREATE TABLE [asset_service_history] (
	[id] varchar(36),
	[asset_id] varchar(36) NOT NULL,
	[organization_id] varchar(36),
	[event_type] varchar(50) NOT NULL,
	[title] varchar(255) NOT NULL,
	[description] text,
	[performed_by] varchar(255),
	[parts_replaced] text,
	[software_installed] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [asset_service_history_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [asset_service_history_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [assets] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[department_id] varchar(36),
	[asset_tag] varchar(100) NOT NULL,
	[name] varchar(255) NOT NULL,
	[type] varchar(50) NOT NULL,
	[brand] varchar(100) NOT NULL,
	[model] varchar(100) NOT NULL,
	[serial_number] varchar(100),
	[qr_code_url] varchar(500),
	[status] varchar(20) NOT NULL CONSTRAINT [assets_status_default] DEFAULT ('active'),
	[purchase_date] varchar(10),
	[warranty_expiry_date] varchar(10),
	[notes] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [assets_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [assets_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [assets_pkey] PRIMARY KEY([id]),
	CONSTRAINT [assets_asset_tag_key] UNIQUE([asset_tag])
);
--> statement-breakpoint
CREATE TABLE [customer_asset_documents] (
	[id] varchar(36),
	[asset_id] varchar(36) NOT NULL,
	[customer_id] varchar(36),
	[document_type] varchar(50) NOT NULL,
	[document_name] varchar(255) NOT NULL,
	[document_url] varchar(500) NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [customer_asset_documents_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [customer_asset_documents_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [customer_devices] (
	[id] varchar(36),
	[customer_id] varchar(36),
	[email] varchar(255) NOT NULL,
	[device_token] varchar(500) NOT NULL,
	[platform] varchar(20) NOT NULL CONSTRAINT [customer_devices_platform_default] DEFAULT ('android'),
	[app_version] varchar(20) NOT NULL CONSTRAINT [customer_devices_app_version_default] DEFAULT ('1.0.0'),
	[is_registered] bit NOT NULL CONSTRAINT [customer_devices_is_registered_default] DEFAULT ((1)),
	[last_active_at] datetime2 NOT NULL CONSTRAINT [customer_devices_last_active_at_default] DEFAULT (getdate()),
	[created_at] datetime2 NOT NULL CONSTRAINT [customer_devices_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [customer_devices_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [customer_profiles] (
	[id] varchar(36),
	[user_id] varchar(36),
	[email] varchar(255) NOT NULL,
	[company_name] varchar(255),
	[customer_name] varchar(255) NOT NULL,
	[phone_number] varchar(50),
	[preferred_contact_method] varchar(20) NOT NULL CONSTRAINT [customer_profiles_preferred_contact_method_default] DEFAULT ('email'),
	[saved_devices_json] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [customer_profiles_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [customer_profiles_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [customer_profiles_pkey] PRIMARY KEY([id]),
	CONSTRAINT [customer_profiles_email_key] UNIQUE([email])
);
--> statement-breakpoint
CREATE TABLE [database_backups] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[filename] varchar(255) NOT NULL,
	[backup_type] varchar(50) NOT NULL CONSTRAINT [database_backups_backup_type_default] DEFAULT ('full_database'),
	[size_bytes] int NOT NULL CONSTRAINT [database_backups_size_bytes_default] DEFAULT ((0)),
	[checksum_sha256] varchar(64),
	[is_encrypted] bit NOT NULL CONSTRAINT [database_backups_is_encrypted_default] DEFAULT ((1)),
	[status] varchar(20) NOT NULL CONSTRAINT [database_backups_status_default] DEFAULT ('completed'),
	[created_at] datetime2 NOT NULL CONSTRAINT [database_backups_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [database_backups_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [database_backups_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [departments] (
	[id] varchar(36),
	[organization_id] varchar(36) NOT NULL,
	[name] varchar(150) NOT NULL,
	[code] varchar(50),
	[head_user_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [departments_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [departments_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [departments_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [email_verifications] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[token_hash] varchar(255) NOT NULL,
	[is_verified] bit NOT NULL CONSTRAINT [email_verifications_is_verified_default] DEFAULT ((0)),
	[expires_at] datetime2 NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [email_verifications_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [email_verifications_pkey] PRIMARY KEY([id]),
	CONSTRAINT [email_verifications_token_hash_key] UNIQUE([token_hash])
);
--> statement-breakpoint
CREATE TABLE [feature_flags] (
	[id] varchar(36),
	[key] varchar(100) NOT NULL,
	[name] varchar(150) NOT NULL,
	[description] text,
	[is_enabled] bit NOT NULL CONSTRAINT [feature_flags_is_enabled_default] DEFAULT ((0)),
	[target_org_id] varchar(36),
	[rollout_percentage] int NOT NULL CONSTRAINT [feature_flags_rollout_percentage_default] DEFAULT ((100)),
	[scheduled_enable_at] datetime2,
	[scheduled_disable_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [feature_flags_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [feature_flags_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [feature_flags_pkey] PRIMARY KEY([id]),
	CONSTRAINT [feature_flags_key_key] UNIQUE([key])
);
--> statement-breakpoint
CREATE TABLE [knowledge_base_articles] (
	[id] varchar(36),
	[title] varchar(255) NOT NULL,
	[category] varchar(50) NOT NULL CONSTRAINT [knowledge_base_articles_category_default] DEFAULT ('General'),
	[content] text NOT NULL,
	[tags] varchar(255),
	[views] int NOT NULL CONSTRAINT [knowledge_base_articles_views_default] DEFAULT ((0)),
	[helpful_count] int NOT NULL CONSTRAINT [knowledge_base_articles_helpful_count_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [knowledge_base_articles_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [knowledge_base_articles_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [knowledge_base_articles_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [maintenance_schedule] (
	[id] varchar(36),
	[asset_id] varchar(36) NOT NULL,
	[organization_id] varchar(36),
	[service_name] varchar(255) NOT NULL,
	[scheduled_date] varchar(10) NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [maintenance_schedule_status_default] DEFAULT ('scheduled'),
	[assigned_engineer_id] varchar(36),
	[created_at] datetime2 NOT NULL CONSTRAINT [maintenance_schedule_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [maintenance_schedule_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [maintenance_schedule_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [mobile_release_builds] (
	[id] varchar(36),
	[platform] varchar(20) NOT NULL,
	[build_version] varchar(20) NOT NULL,
	[bundle_url] varchar(500) NOT NULL,
	[release_notes] text,
	[is_mandatory_update] bit NOT NULL CONSTRAINT [mobile_release_builds_is_mandatory_update_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [mobile_release_builds_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [mobile_release_builds_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [mobile_security_audits] (
	[id] varchar(36),
	[engineer_id] varchar(36),
	[device_token] varchar(500) NOT NULL,
	[platform] varchar(20) NOT NULL CONSTRAINT [mobile_security_audits_platform_default] DEFAULT ('android'),
	[is_rooted] bit NOT NULL CONSTRAINT [mobile_security_audits_is_rooted_default] DEFAULT ((0)),
	[is_jailbroken] bit NOT NULL CONSTRAINT [mobile_security_audits_is_jailbroken_default] DEFAULT ((0)),
	[app_integrity_hash] varchar(128) NOT NULL,
	[security_check_passed] bit NOT NULL CONSTRAINT [mobile_security_audits_security_check_passed_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [mobile_security_audits_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [mobile_security_audits_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [notification_queue] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[user_id] varchar(36),
	[event_key] varchar(100) NOT NULL,
	[channel] varchar(20) NOT NULL CONSTRAINT [notification_queue_channel_default] DEFAULT ('in_app'),
	[recipient] varchar(255) NOT NULL,
	[title] varchar(255) NOT NULL,
	[message] text NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [notification_queue_status_default] DEFAULT ('pending'),
	[retry_count] int NOT NULL CONSTRAINT [notification_queue_retry_count_default] DEFAULT ((0)),
	[last_error] text,
	[sent_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [notification_queue_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [notification_queue_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [notification_templates] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[event_key] varchar(100) NOT NULL,
	[channel] varchar(20) NOT NULL CONSTRAINT [notification_templates_channel_default] DEFAULT ('in_app'),
	[subject] varchar(255) NOT NULL,
	[body_template] text NOT NULL,
	[is_enabled] bit NOT NULL CONSTRAINT [notification_templates_is_enabled_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [notification_templates_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [notification_templates_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [notification_templates_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [offline_sync_conflicts] (
	[id] varchar(36),
	[engineer_id] varchar(36) NOT NULL,
	[queue_item_id] varchar(36) NOT NULL,
	[conflict_reason] varchar(255) NOT NULL,
	[client_timestamp] datetime2 NOT NULL,
	[server_timestamp] datetime2 NOT NULL CONSTRAINT [offline_sync_conflicts_server_timestamp_default] DEFAULT (getdate()),
	[resolved_payload_json] text,
	[status] varchar(20) NOT NULL CONSTRAINT [offline_sync_conflicts_status_default] DEFAULT ('resolved'),
	[created_at] datetime2 NOT NULL CONSTRAINT [offline_sync_conflicts_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [offline_sync_conflicts_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [offline_sync_queue] (
	[id] varchar(36),
	[engineer_id] varchar(36) NOT NULL,
	[action_type] varchar(50) NOT NULL,
	[payload_json] text NOT NULL,
	[status] varchar(20) NOT NULL CONSTRAINT [offline_sync_queue_status_default] DEFAULT ('pending'),
	[retry_count] int NOT NULL CONSTRAINT [offline_sync_queue_retry_count_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [offline_sync_queue_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [offline_sync_queue_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [organizations] (
	[id] varchar(36),
	[name] varchar(255) NOT NULL,
	[slug] varchar(100) NOT NULL,
	[domain] varchar(255),
	[tier] varchar(50) NOT NULL CONSTRAINT [organizations_tier_default] DEFAULT ('enterprise'),
	[max_endpoints] int NOT NULL CONSTRAINT [organizations_max_endpoints_default] DEFAULT ((50)),
	[logo_url] varchar(500),
	[status] varchar(20) NOT NULL CONSTRAINT [organizations_status_default] DEFAULT ('active'),
	[created_at] datetime2 NOT NULL CONSTRAINT [organizations_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [organizations_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [organizations_pkey] PRIMARY KEY([id]),
	CONSTRAINT [organizations_slug_key] UNIQUE([slug])
);
--> statement-breakpoint
CREATE TABLE [otp_codes] (
	[id] varchar(36),
	[email] varchar(255) NOT NULL,
	[code] varchar(10) NOT NULL,
	[token] varchar(128) NOT NULL,
	[expires_at] datetime2 NOT NULL,
	[is_used] bit NOT NULL CONSTRAINT [otp_codes_is_used_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [otp_codes_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [otp_codes_pkey] PRIMARY KEY([id]),
	CONSTRAINT [otp_codes_token_key] UNIQUE([token])
);
--> statement-breakpoint
CREATE TABLE [password_resets] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[token_hash] varchar(255) NOT NULL,
	[is_used] bit NOT NULL CONSTRAINT [password_resets_is_used_default] DEFAULT ((0)),
	[expires_at] datetime2 NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [password_resets_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [password_resets_pkey] PRIMARY KEY([id]),
	CONSTRAINT [password_resets_token_hash_key] UNIQUE([token_hash])
);
--> statement-breakpoint
CREATE TABLE [permissions] (
	[id] varchar(36),
	[role_id] varchar(36) NOT NULL,
	[resource] varchar(50) NOT NULL,
	[action] varchar(50) NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [permissions_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [permissions_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [projects] (
	[id] varchar(36),
	[name] varchar(255) NOT NULL,
	[path] varchar(500) NOT NULL,
	[description] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [projects_created_at_default] DEFAULT (getdate()),
	[last_opened] datetime2,
	CONSTRAINT [projects_pkey] PRIMARY KEY([id]),
	CONSTRAINT [projects_path_key] UNIQUE([path])
);
--> statement-breakpoint
CREATE TABLE [push_notifications] (
	[id] varchar(36),
	[recipient_type] varchar(20) NOT NULL,
	[recipient_id] varchar(255) NOT NULL,
	[title] varchar(255) NOT NULL,
	[body] text NOT NULL,
	[payload_json] text,
	[is_read] bit NOT NULL CONSTRAINT [push_notifications_is_read_default] DEFAULT ((0)),
	[sent_at] datetime2 NOT NULL CONSTRAINT [push_notifications_sent_at_default] DEFAULT (getdate()),
	CONSTRAINT [push_notifications_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [refresh_tokens] (
	[id] varchar(36),
	[user_id] varchar(36) NOT NULL,
	[token_hash] varchar(255) NOT NULL,
	[user_agent] varchar(500),
	[ip_address] varchar(45),
	[is_revoked] bit NOT NULL CONSTRAINT [refresh_tokens_is_revoked_default] DEFAULT ((0)),
	[expires_at] datetime2 NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [refresh_tokens_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY([id]),
	CONSTRAINT [refresh_tokens_token_hash_key] UNIQUE([token_hash])
);
--> statement-breakpoint
CREATE TABLE [rmm_endpoints] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[asset_id] varchar(36),
	[hostname] varchar(255) NOT NULL,
	[os_version] varchar(150) NOT NULL,
	[ip_address] varchar(45),
	[mac_address] varchar(50),
	[cpu_usage_percent] decimal(5,2) CONSTRAINT [rmm_endpoints_cpu_usage_percent_default] DEFAULT ((0.00)),
	[ram_usage_percent] decimal(5,2) CONSTRAINT [rmm_endpoints_ram_usage_percent_default] DEFAULT ((0.00)),
	[disk_usage_percent] decimal(5,2) CONSTRAINT [rmm_endpoints_disk_usage_percent_default] DEFAULT ((0.00)),
	[status] varchar(20) NOT NULL CONSTRAINT [rmm_endpoints_status_default] DEFAULT ('online'),
	[last_heartbeat_at] datetime2 NOT NULL CONSTRAINT [rmm_endpoints_last_heartbeat_at_default] DEFAULT (getdate()),
	[created_at] datetime2 NOT NULL CONSTRAINT [rmm_endpoints_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [rmm_endpoints_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [rmm_endpoints_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [rmm_scripts] (
	[id] varchar(36),
	[name] varchar(150) NOT NULL,
	[category] varchar(50) NOT NULL,
	[shell_type] varchar(20) NOT NULL CONSTRAINT [rmm_scripts_shell_type_default] DEFAULT ('powershell'),
	[script_content] text NOT NULL,
	[description] text,
	[is_system] bit NOT NULL CONSTRAINT [rmm_scripts_is_system_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [rmm_scripts_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [rmm_scripts_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [rmm_scripts_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [roles] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[name] varchar(50) NOT NULL,
	[display_name] varchar(100) NOT NULL,
	[description] text,
	[is_system] bit NOT NULL CONSTRAINT [roles_is_system_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [roles_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [roles_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [roles_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [sla_policies] (
	[id] varchar(36),
	[name] varchar(150) NOT NULL,
	[priority] varchar(20) NOT NULL,
	[response_buffer_minutes] int NOT NULL,
	[resolution_buffer_minutes] int NOT NULL,
	[escalation_email] varchar(255),
	[is_default] bit NOT NULL CONSTRAINT [sla_policies_is_default_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [sla_policies_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [sla_policies_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [sla_policies_pkey] PRIMARY KEY([id]),
	CONSTRAINT [sla_policies_priority_key] UNIQUE([priority])
);
--> statement-breakpoint
CREATE TABLE [sso_providers] (
	[id] varchar(36),
	[organization_id] varchar(36),
	[provider_type] varchar(50) NOT NULL,
	[issuer_url] varchar(500) NOT NULL,
	[sso_url] varchar(500) NOT NULL,
	[certificate_pem] text,
	[domain] varchar(255),
	[is_enabled] bit NOT NULL CONSTRAINT [sso_providers_is_enabled_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [sso_providers_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [sso_providers_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [sso_providers_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [technician_devices] (
	[id] varchar(36),
	[engineer_id] varchar(36) NOT NULL,
	[device_token] varchar(500) NOT NULL,
	[platform] varchar(20) NOT NULL CONSTRAINT [technician_devices_platform_default] DEFAULT ('android'),
	[app_version] varchar(20) NOT NULL CONSTRAINT [technician_devices_app_version_default] DEFAULT ('1.0.0'),
	[is_registered] bit NOT NULL CONSTRAINT [technician_devices_is_registered_default] DEFAULT ((1)),
	[last_sync_at] datetime2 NOT NULL CONSTRAINT [technician_devices_last_sync_at_default] DEFAULT (getdate()),
	[created_at] datetime2 NOT NULL CONSTRAINT [technician_devices_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [technician_devices_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [technician_local_inventory] (
	[id] varchar(36),
	[engineer_id] varchar(36) NOT NULL,
	[part_number] varchar(50) NOT NULL,
	[part_name] varchar(255) NOT NULL,
	[quantity_on_hand] int NOT NULL CONSTRAINT [technician_local_inventory_quantity_on_hand_default] DEFAULT ((0)),
	[quantity_reserved] int NOT NULL CONSTRAINT [technician_local_inventory_quantity_reserved_default] DEFAULT ((0)),
	[last_synced_at] datetime2 NOT NULL CONSTRAINT [technician_local_inventory_last_synced_at_default] DEFAULT (getdate()),
	CONSTRAINT [technician_local_inventory_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [technician_work_logs] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[engineer_id] varchar(36) NOT NULL,
	[check_in_time] datetime2,
	[check_out_time] datetime2,
	[check_in_lat] decimal(10,7),
	[check_in_lng] decimal(10,7),
	[check_out_lat] decimal(10,7),
	[check_out_lng] decimal(10,7),
	[before_photos_json] text,
	[after_photos_json] text,
	[digital_signature_url] text,
	[total_minutes] int,
	[notes] text,
	[created_at] datetime2 NOT NULL CONSTRAINT [technician_work_logs_created_at_default] DEFAULT (getdate()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [technician_work_logs_updated_at_default] DEFAULT (getdate()),
	CONSTRAINT [technician_work_logs_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [ticket_feedback] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[customer_id] varchar(36),
	[rating] int NOT NULL CONSTRAINT [ticket_feedback_rating_default] DEFAULT ((5)),
	[feedback_text] text,
	[technician_rating] int NOT NULL CONSTRAINT [ticket_feedback_technician_rating_default] DEFAULT ((5)),
	[is_public] bit NOT NULL CONSTRAINT [ticket_feedback_is_public_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [ticket_feedback_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [ticket_feedback_pkey] PRIMARY KEY([id])
);
--> statement-breakpoint
CREATE TABLE [tracking_tokens] (
	[id] varchar(36),
	[booking_id] varchar(36) NOT NULL,
	[token] varchar(128) NOT NULL,
	[expires_at] datetime2 NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [tracking_tokens_created_at_default] DEFAULT (getdate()),
	CONSTRAINT [tracking_tokens_pkey] PRIMARY KEY([id]),
	CONSTRAINT [tracking_tokens_token_key] UNIQUE([token])
);
--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [department_id] varchar(36);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [action_type] varchar(100);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [entity_type] varchar(50);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [entity_id] varchar(36);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [old_values_json] text;--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [new_values_json] text;--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [reason] varchar(500);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [status] varchar(20) NOT NULL CONSTRAINT [audit_logs_status_default] DEFAULT ('success');--> statement-breakpoint
ALTER TABLE [audit_logs] ADD [user_agent] varchar(500);--> statement-breakpoint
ALTER TABLE [bookings] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [bookings] ADD [department_id] varchar(36);--> statement-breakpoint
ALTER TABLE [bookings] ADD [asset_id] varchar(36);--> statement-breakpoint
ALTER TABLE [bookings] ADD [sla_policy_id] varchar(36);--> statement-breakpoint
ALTER TABLE [bookings] ADD [first_response_due_at] datetime2;--> statement-breakpoint
ALTER TABLE [bookings] ADD [resolution_due_at] datetime2;--> statement-breakpoint
ALTER TABLE [bookings] ADD [is_sla_breached] bit NOT NULL CONSTRAINT [bookings_is_sla_breached_default] DEFAULT ((0));--> statement-breakpoint
ALTER TABLE [customers] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [engineers] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [invoices] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [services] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [tickets] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [tickets] ADD [department_id] varchar(36);--> statement-breakpoint
ALTER TABLE [tickets] ADD [asset_id] varchar(36);--> statement-breakpoint
ALTER TABLE [tickets] ADD [sla_policy_id] varchar(36);--> statement-breakpoint
ALTER TABLE [tickets] ADD [first_response_due_at] datetime2;--> statement-breakpoint
ALTER TABLE [tickets] ADD [resolution_due_at] datetime2;--> statement-breakpoint
ALTER TABLE [tickets] ADD [is_sla_breached] bit NOT NULL CONSTRAINT [tickets_is_sla_breached_default] DEFAULT ((0));--> statement-breakpoint
ALTER TABLE [users] ADD [organization_id] varchar(36);--> statement-breakpoint
ALTER TABLE [users] ADD [department_id] varchar(36);--> statement-breakpoint
ALTER TABLE [users] ADD [role_id] varchar(36);--> statement-breakpoint
ALTER TABLE [users] ADD [email_verified] bit NOT NULL CONSTRAINT [users_email_verified_default] DEFAULT ((0));--> statement-breakpoint
ALTER TABLE [users] ADD [email_verified_at] datetime2;--> statement-breakpoint
ALTER TABLE [users] ALTER COLUMN [role] varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE [ai_copilot_messages] ADD CONSTRAINT [ai_copilot_messages_session_id_ai_copilot_sessions_id_fk] FOREIGN KEY ([session_id]) REFERENCES [ai_copilot_sessions]([id]);--> statement-breakpoint
ALTER TABLE [amc_contracts] ADD CONSTRAINT [amc_contracts_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [amc_contracts] ADD CONSTRAINT [amc_contracts_customer_id_customers_id_fk] FOREIGN KEY ([customer_id]) REFERENCES [customers]([id]);--> statement-breakpoint
ALTER TABLE [asset_service_history] ADD CONSTRAINT [asset_service_history_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [asset_service_history] ADD CONSTRAINT [asset_service_history_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [assets] ADD CONSTRAINT [assets_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [assets] ADD CONSTRAINT [assets_department_id_departments_id_fk] FOREIGN KEY ([department_id]) REFERENCES [departments]([id]);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD CONSTRAINT [audit_logs_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [audit_logs] ADD CONSTRAINT [audit_logs_department_id_departments_id_fk] FOREIGN KEY ([department_id]) REFERENCES [departments]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_department_id_departments_id_fk] FOREIGN KEY ([department_id]) REFERENCES [departments]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [bookings] ADD CONSTRAINT [bookings_sla_policy_id_sla_policies_id_fk] FOREIGN KEY ([sla_policy_id]) REFERENCES [sla_policies]([id]);--> statement-breakpoint
ALTER TABLE [customer_asset_documents] ADD CONSTRAINT [customer_asset_documents_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [customer_asset_documents] ADD CONSTRAINT [customer_asset_documents_customer_id_customers_id_fk] FOREIGN KEY ([customer_id]) REFERENCES [customers]([id]);--> statement-breakpoint
ALTER TABLE [customer_devices] ADD CONSTRAINT [customer_devices_customer_id_customers_id_fk] FOREIGN KEY ([customer_id]) REFERENCES [customers]([id]);--> statement-breakpoint
ALTER TABLE [customer_profiles] ADD CONSTRAINT [customer_profiles_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [customers] ADD CONSTRAINT [customers_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [database_backups] ADD CONSTRAINT [database_backups_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [departments] ADD CONSTRAINT [departments_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [email_verifications] ADD CONSTRAINT [email_verifications_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [engineers] ADD CONSTRAINT [engineers_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [feature_flags] ADD CONSTRAINT [feature_flags_target_org_id_organizations_id_fk] FOREIGN KEY ([target_org_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [invoices] ADD CONSTRAINT [invoices_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [maintenance_schedule] ADD CONSTRAINT [maintenance_schedule_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [maintenance_schedule] ADD CONSTRAINT [maintenance_schedule_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [maintenance_schedule] ADD CONSTRAINT [maintenance_schedule_assigned_engineer_id_engineers_id_fk] FOREIGN KEY ([assigned_engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [notification_queue] ADD CONSTRAINT [notification_queue_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [notification_queue] ADD CONSTRAINT [notification_queue_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [notification_templates] ADD CONSTRAINT [notification_templates_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [offline_sync_conflicts] ADD CONSTRAINT [offline_sync_conflicts_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [offline_sync_queue] ADD CONSTRAINT [offline_sync_queue_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [password_resets] ADD CONSTRAINT [password_resets_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [permissions] ADD CONSTRAINT [permissions_role_id_roles_id_fk] FOREIGN KEY ([role_id]) REFERENCES [roles]([id]);--> statement-breakpoint
ALTER TABLE [refresh_tokens] ADD CONSTRAINT [refresh_tokens_user_id_users_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([id]);--> statement-breakpoint
ALTER TABLE [rmm_endpoints] ADD CONSTRAINT [rmm_endpoints_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [rmm_endpoints] ADD CONSTRAINT [rmm_endpoints_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [roles] ADD CONSTRAINT [roles_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [services] ADD CONSTRAINT [services_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [sso_providers] ADD CONSTRAINT [sso_providers_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [technician_devices] ADD CONSTRAINT [technician_devices_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [technician_local_inventory] ADD CONSTRAINT [technician_local_inventory_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [technician_work_logs] ADD CONSTRAINT [technician_work_logs_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [technician_work_logs] ADD CONSTRAINT [technician_work_logs_engineer_id_engineers_id_fk] FOREIGN KEY ([engineer_id]) REFERENCES [engineers]([id]);--> statement-breakpoint
ALTER TABLE [ticket_feedback] ADD CONSTRAINT [ticket_feedback_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_department_id_departments_id_fk] FOREIGN KEY ([department_id]) REFERENCES [departments]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_asset_id_assets_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([id]);--> statement-breakpoint
ALTER TABLE [tickets] ADD CONSTRAINT [tickets_sla_policy_id_sla_policies_id_fk] FOREIGN KEY ([sla_policy_id]) REFERENCES [sla_policies]([id]);--> statement-breakpoint
ALTER TABLE [tracking_tokens] ADD CONSTRAINT [tracking_tokens_booking_id_bookings_id_fk] FOREIGN KEY ([booking_id]) REFERENCES [bookings]([id]);--> statement-breakpoint
ALTER TABLE [users] ADD CONSTRAINT [users_organization_id_organizations_id_fk] FOREIGN KEY ([organization_id]) REFERENCES [organizations]([id]);--> statement-breakpoint
ALTER TABLE [users] ADD CONSTRAINT [users_department_id_departments_id_fk] FOREIGN KEY ([department_id]) REFERENCES [departments]([id]);--> statement-breakpoint
ALTER TABLE [users] ADD CONSTRAINT [users_role_id_roles_id_fk] FOREIGN KEY ([role_id]) REFERENCES [roles]([id]);--> statement-breakpoint
CREATE INDEX [idx_acm_session_id] ON [ai_copilot_messages] ([session_id]);--> statement-breakpoint
CREATE INDEX [idx_acm_created_at] ON [ai_copilot_messages] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_acs_user_id] ON [ai_copilot_sessions] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_acs_role] ON [ai_copilot_sessions] ([user_role]);--> statement-breakpoint
CREATE INDEX [idx_ams_type_key] ON [ai_memory_store] ([memory_type],[memory_key]);--> statement-breakpoint
CREATE INDEX [idx_ams_tenant] ON [ai_memory_store] ([tenant_id]);--> statement-breakpoint
CREATE INDEX [idx_aol_request_type] ON [ai_orchestrator_logs] ([request_type]);--> statement-breakpoint
CREATE INDEX [idx_aol_provider] ON [ai_orchestrator_logs] ([provider_used]);--> statement-breakpoint
CREATE INDEX [idx_aol_created_at] ON [ai_orchestrator_logs] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_arql_user_id] ON [ai_rag_query_logs] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_atal_user_id] ON [ai_tool_audit_logs] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_atal_tool_id] ON [ai_tool_audit_logs] ([tool_id]);--> statement-breakpoint
CREATE INDEX [idx_atal_created_at] ON [ai_tool_audit_logs] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_avks_category] ON [ai_vector_knowledge_store] ([category]);--> statement-breakpoint
CREATE INDEX [idx_avks_tenant] ON [ai_vector_knowledge_store] ([tenant_id]);--> statement-breakpoint
CREATE INDEX [idx_amc_contract_number] ON [amc_contracts] ([contract_number]);--> statement-breakpoint
CREATE INDEX [idx_amc_status] ON [amc_contracts] ([status]);--> statement-breakpoint
CREATE INDEX [idx_amc_org_id] ON [amc_contracts] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_amc_end_date] ON [amc_contracts] ([end_date]);--> statement-breakpoint
CREATE INDEX [idx_ash_asset_id] ON [asset_service_history] ([asset_id]);--> statement-breakpoint
CREATE INDEX [idx_ash_event_type] ON [asset_service_history] ([event_type]);--> statement-breakpoint
CREATE INDEX [idx_ash_created_at] ON [asset_service_history] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_assets_tag] ON [assets] ([asset_tag]);--> statement-breakpoint
CREATE INDEX [idx_assets_org_id] ON [assets] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_assets_status] ON [assets] ([status]);--> statement-breakpoint
CREATE INDEX [idx_assets_type] ON [assets] ([type]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_user_id] ON [audit_logs] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_action] ON [audit_logs] ([action]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_action_type] ON [audit_logs] ([action_type]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_entity] ON [audit_logs] ([entity_type],[entity_id]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_org_id] ON [audit_logs] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_audit_logs_created_at] ON [audit_logs] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_booking_images_booking_id] ON [booking_images] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_customer_id] ON [bookings] ([customer_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_engineer_id] ON [bookings] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_ticket_id] ON [bookings] ([ticket_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_status] ON [bookings] ([status]);--> statement-breakpoint
CREATE INDEX [idx_bookings_phone] ON [bookings] ([phone]);--> statement-breakpoint
CREATE INDEX [idx_bookings_org_id] ON [bookings] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_asset_id] ON [bookings] ([asset_id]);--> statement-breakpoint
CREATE INDEX [idx_bookings_sla_breached] ON [bookings] ([is_sla_breached]);--> statement-breakpoint
CREATE INDEX [idx_bookings_created_at] ON [bookings] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_cad_asset_id] ON [customer_asset_documents] ([asset_id]);--> statement-breakpoint
CREATE INDEX [idx_cad_customer_id] ON [customer_asset_documents] ([customer_id]);--> statement-breakpoint
CREATE INDEX [idx_cd_customer_id] ON [customer_devices] ([customer_id]);--> statement-breakpoint
CREATE INDEX [idx_cd_email] ON [customer_devices] ([email]);--> statement-breakpoint
CREATE INDEX [idx_customer_profiles_user] ON [customer_profiles] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_customer_profiles_email] ON [customer_profiles] ([email]);--> statement-breakpoint
CREATE INDEX [idx_customers_user_id] ON [customers] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_customers_phone] ON [customers] ([phone]);--> statement-breakpoint
CREATE INDEX [idx_customers_org_id] ON [customers] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_backups_org_id] ON [database_backups] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_backups_status] ON [database_backups] ([status]);--> statement-breakpoint
CREATE INDEX [idx_backups_created_at] ON [database_backups] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_depts_org_id] ON [departments] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_email_verifications_token_hash] ON [email_verifications] ([token_hash]);--> statement-breakpoint
CREATE INDEX [idx_engineers_user_id] ON [engineers] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_engineers_status] ON [engineers] ([status]);--> statement-breakpoint
CREATE INDEX [idx_engineers_org_id] ON [engineers] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_feature_flags_key] ON [feature_flags] ([key]);--> statement-breakpoint
CREATE INDEX [idx_feature_flags_target_org] ON [feature_flags] ([target_org_id]);--> statement-breakpoint
CREATE INDEX [idx_invoices_booking_id] ON [invoices] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_invoices_invoice_number] ON [invoices] ([invoice_number]);--> statement-breakpoint
CREATE INDEX [idx_invoices_status] ON [invoices] ([status]);--> statement-breakpoint
CREATE INDEX [idx_invoices_org_id] ON [invoices] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_kb_category] ON [knowledge_base_articles] ([category]);--> statement-breakpoint
CREATE INDEX [idx_kb_title] ON [knowledge_base_articles] ([title]);--> statement-breakpoint
CREATE INDEX [idx_ms_asset_id] ON [maintenance_schedule] ([asset_id]);--> statement-breakpoint
CREATE INDEX [idx_ms_status] ON [maintenance_schedule] ([status]);--> statement-breakpoint
CREATE INDEX [idx_ms_scheduled_date] ON [maintenance_schedule] ([scheduled_date]);--> statement-breakpoint
CREATE INDEX [idx_mrb_platform] ON [mobile_release_builds] ([platform]);--> statement-breakpoint
CREATE INDEX [idx_mrb_version] ON [mobile_release_builds] ([build_version]);--> statement-breakpoint
CREATE INDEX [idx_msa_device_token] ON [mobile_security_audits] ([device_token]);--> statement-breakpoint
CREATE INDEX [idx_msa_platform] ON [mobile_security_audits] ([platform]);--> statement-breakpoint
CREATE INDEX [idx_notif_queue_status] ON [notification_queue] ([status]);--> statement-breakpoint
CREATE INDEX [idx_notif_queue_user_id] ON [notification_queue] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_notif_queue_created_at] ON [notification_queue] ([created_at]);--> statement-breakpoint
CREATE INDEX [idx_notif_templates_event] ON [notification_templates] ([event_key]);--> statement-breakpoint
CREATE INDEX [idx_notif_templates_channel] ON [notification_templates] ([channel]);--> statement-breakpoint
CREATE INDEX [idx_osc_engineer_id] ON [offline_sync_conflicts] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_osc_status] ON [offline_sync_conflicts] ([status]);--> statement-breakpoint
CREATE INDEX [idx_osq_engineer_id] ON [offline_sync_queue] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_osq_status] ON [offline_sync_queue] ([status]);--> statement-breakpoint
CREATE INDEX [idx_orgs_slug] ON [organizations] ([slug]);--> statement-breakpoint
CREATE INDEX [idx_orgs_status] ON [organizations] ([status]);--> statement-breakpoint
CREATE INDEX [idx_otp_codes_email] ON [otp_codes] ([email]);--> statement-breakpoint
CREATE INDEX [idx_otp_codes_code] ON [otp_codes] ([code]);--> statement-breakpoint
CREATE INDEX [idx_otp_codes_token] ON [otp_codes] ([token]);--> statement-breakpoint
CREATE INDEX [idx_password_resets_token_hash] ON [password_resets] ([token_hash]);--> statement-breakpoint
CREATE INDEX [idx_password_resets_user_id] ON [password_resets] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_payments_invoice_id] ON [payments] ([invoice_id]);--> statement-breakpoint
CREATE INDEX [idx_payments_status] ON [payments] ([status]);--> statement-breakpoint
CREATE INDEX [idx_permissions_role_id] ON [permissions] ([role_id]);--> statement-breakpoint
CREATE INDEX [idx_permissions_resource_action] ON [permissions] ([resource],[action]);--> statement-breakpoint
CREATE INDEX [idx_projects_path] ON [projects] ([path]);--> statement-breakpoint
CREATE INDEX [idx_pn_recipient] ON [push_notifications] ([recipient_type],[recipient_id]);--> statement-breakpoint
CREATE INDEX [idx_pn_sent_at] ON [push_notifications] ([sent_at]);--> statement-breakpoint
CREATE INDEX [idx_refresh_tokens_user_id] ON [refresh_tokens] ([user_id]);--> statement-breakpoint
CREATE INDEX [idx_refresh_tokens_token_hash] ON [refresh_tokens] ([token_hash]);--> statement-breakpoint
CREATE INDEX [idx_reviews_booking_id] ON [reviews] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_rmm_hostname] ON [rmm_endpoints] ([hostname]);--> statement-breakpoint
CREATE INDEX [idx_rmm_status] ON [rmm_endpoints] ([status]);--> statement-breakpoint
CREATE INDEX [idx_rmm_org_id] ON [rmm_endpoints] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_rmm_last_heartbeat] ON [rmm_endpoints] ([last_heartbeat_at]);--> statement-breakpoint
CREATE INDEX [idx_rmm_scripts_category] ON [rmm_scripts] ([category]);--> statement-breakpoint
CREATE INDEX [idx_rmm_scripts_shell] ON [rmm_scripts] ([shell_type]);--> statement-breakpoint
CREATE INDEX [idx_roles_org_id] ON [roles] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_roles_name] ON [roles] ([name]);--> statement-breakpoint
CREATE INDEX [idx_services_category] ON [services] ([category]);--> statement-breakpoint
CREATE INDEX [idx_services_is_active] ON [services] ([is_active]);--> statement-breakpoint
CREATE INDEX [idx_services_org_id] ON [services] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_sla_priority] ON [sla_policies] ([priority]);--> statement-breakpoint
CREATE INDEX [idx_sso_org_id] ON [sso_providers] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_sso_provider_type] ON [sso_providers] ([provider_type]);--> statement-breakpoint
CREATE INDEX [idx_td_engineer_id] ON [technician_devices] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_td_platform] ON [technician_devices] ([platform]);--> statement-breakpoint
CREATE INDEX [idx_tli_engineer_id] ON [technician_local_inventory] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_tli_part_number] ON [technician_local_inventory] ([part_number]);--> statement-breakpoint
CREATE INDEX [idx_tech_logs_booking_id] ON [technician_work_logs] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_tech_logs_engineer_id] ON [technician_work_logs] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_tf_booking_id] ON [ticket_feedback] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_tf_rating] ON [ticket_feedback] ([rating]);--> statement-breakpoint
CREATE INDEX [idx_ticket_messages_ticket_id] ON [ticket_messages] ([ticket_id]);--> statement-breakpoint
CREATE INDEX [idx_tickets_customer_id] ON [tickets] ([customer_id]);--> statement-breakpoint
CREATE INDEX [idx_tickets_engineer_id] ON [tickets] ([engineer_id]);--> statement-breakpoint
CREATE INDEX [idx_tickets_status] ON [tickets] ([status]);--> statement-breakpoint
CREATE INDEX [idx_tickets_org_id] ON [tickets] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_tickets_asset_id] ON [tickets] ([asset_id]);--> statement-breakpoint
CREATE INDEX [idx_tickets_sla_breached] ON [tickets] ([is_sla_breached]);--> statement-breakpoint
CREATE INDEX [idx_tracking_tokens_booking] ON [tracking_tokens] ([booking_id]);--> statement-breakpoint
CREATE INDEX [idx_tracking_tokens_token] ON [tracking_tokens] ([token]);--> statement-breakpoint
CREATE INDEX [idx_users_email] ON [users] ([email]);--> statement-breakpoint
CREATE INDEX [idx_users_role] ON [users] ([role]);--> statement-breakpoint
CREATE INDEX [idx_users_status] ON [users] ([status]);--> statement-breakpoint
CREATE INDEX [idx_users_org_id] ON [users] ([organization_id]);--> statement-breakpoint
CREATE INDEX [idx_users_role_id] ON [users] ([role_id]);