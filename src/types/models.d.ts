/* eslint-disable max-len */
/**
 * AUTO-GENERATED TypeScript Type Definitions
 *
 * Generated from backend model schemas.
 * DO NOT EDIT MANUALLY - Changes will be overwritten.
 *
 * Generated: 2026-10-14T22:38:14.329Z
 * Models: 53
 */

/**
 * Account model interface
 * Generated from backend schema
 */
export interface Account {
  /** Unique identifier for the profile. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this account. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The accountType of this account. @property {UUID} accountTypeId - Foreign key to accountType @access READ, UPDATE, CREATE @required for creation */
  accountTypeId: string;

  /** User's Identity.Status - controls if this identity is active, pending, trashed. @property {Enum} sex - One of: active, pending @access READ, UPDATE */
  status?: 'pending' | 'active' | 'inactive' | 'deleted' | 'disabled';

  /** Human name for Admin UI and audits. @property {String} description @access READ, UPDATE, CREATE */
  label?: string;

  tierLimits?: Record<string, unknown>;

  billingInfo?: Record<string, unknown>;

  /** Optional, non-enforcing metadata for diagnostics / labels / ops notes. Not read by BusinessRuleSetEngine for enforcement. Editable post-publish. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  /** Whether this account allows membership functionality. @property {Boolean} allowsMembership @access READ, UPDATE, CREATE */
  allowsMembership?: boolean;

  /** The account's jurisdiction country. Drives policy and compliance decisions. Nullable at the column level — system accounts bypass business rules and carry no jurisdiction. Presence is enforced for real users at registration. @property {UUID} countryId - Foreign key to country @access READ, UPDATE, CREATE @optional */
  countryId?: string;

  /** The account's jurisdiction subdivision (state/province). Refines policy and compliance, including state-to-state enforcement for regular users. Nullable at the column level — system accounts bypass business rules and carry no jurisdiction. Presence is enforced for real users at registration. @property {UUID} subdivisionId - Foreign key to subdivision @access READ, UPDATE, CREATE @optional */
  subdivisionId?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * HandleReservation model interface
 * Generated from backend schema
 */
export interface HandleReservation {
  /** Unique identifier for the handle reservation record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this handle reservation. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The reserved @handle (e.g., "willtenny"). @property {String} handle - The reserved handle name @access READ, UPDATE, CREATE @required for creation */
  handle: string;

  /** Platform this reservation applies to (e.g., Instagram, YouTube). @property {String} platform - Social media platform identifier @access READ, UPDATE, CREATE @required for creation */
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'twitter';

  /** Optional welcome or internal admin message. @property {String} customMessage - Custom message for the handle owner @access READ, UPDATE, CREATE */
  customMessage?: string;

  /** Timestamp when the handle was successfully verified and claimed. @property {Date} verifiedOn - Verification timestamp @access READ, UPDATE, CREATE */
  verifiedOn?: Date;

  /** Profile that successfully claimed this handle reservation. @property {UUID} claimedByProfileId - Foreign key to profile who claimed @access READ, UPDATE, CREATE */
  claimedByProfileId?: string;

  /** Support agent profile that manually verified the claim. @property {UUID} manuallyVerifiedBy - Foreign key to support agent profile @access READ, UPDATE, CREATE */
  manuallyVerifiedBy?: string;

  /** Reference to the verification code used for claiming this handle. @property {UUID} claimCode - Foreign key to verificationCode @access READ, UPDATE, CREATE */
  claimCode?: string;

  /** Current status of the handle reservation in its lifecycle. - available: Handle is reserved but not yet claimed - pending: Registration submitted, awaiting verification - claimed: Handle successfully claimed and verified - locked: Handle locked due to failed attempts or business rule violation @property {String} status - Reservation lifecycle status @access READ, UPDATE, CREATE */
  status?: 'available' | 'pending' | 'claimed' | 'locked';

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Identity model interface
 * Generated from backend schema
 */
export interface Identity {
  /** Unique identifier for the identity. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the identity that owns this profile. @property {UUID} ownerId - Foreign key to identity @access READ only @required for creation */
  ownerId: string;

  /** User's email address, used for authentication and communications. @property {String} email - Must be unique and valid email format @access READ, UPDATE @required for creation */
  email: string;

  /** User's email address, used for authentication and communications. @property {String} email - Must be unique and valid email format @access READ, UPDATE @required for creation */
  recoveryEmail?: string;

  /** User's password for authentication. @property {String} password - Stored securely, never returned in queries @access UPDATE_PASSWORD only @required for creation */
  password: string;

  /** User's first name. @property {String} firstname @access READ, UPDATE @required for creation */
  firstname: string;

  /** User's last name. @property {String} lastname @access READ, UPDATE @required for creation */
  lastname: string;

  /** User's date of birth. Must be between 16-120 years old. @property {Date} dob - Date of birth @access READ, UPDATE */
  dob?: Date;

  /** User's Identity.Status - controls if this identity is active, pending, trashed. @property {Enum} sex - One of: active, pending @access READ, UPDATE */
  status?: 'active' | 'pending' | 'locked' | 'disabled';

  /** Timestamp when the user's email address was verified. Null indicates unverified email. @property {Date} emailVerifiedAt - Verification timestamp @access READ, UPDATE */
  emailVerifiedAt?: Date;

  /** Status of identity verification (government ID, biometric, etc). @property {Enum} identityVerificationStatus - One of: unverified, pending, verified, rejected, revoked @access READ, UPDATE */
  identityVerificationStatus?: 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected' | 'revoked';

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Profile model interface
 * Generated from backend schema
 */
export interface Profile {
  /** Unique identifier for the profile. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the account that owns this profile. @property {UUID} ownerId - Foreign key to identity @access READ only @required for creation */
  ownerId: string;

  /** Unique handle/username for the profile, used in URLs and mentions. @property {String} handle - Alphanumeric with underscores @access READ, UPDATE @required for creation */
  handle?: string;

  /** User's biography or profile description. @property {Text} bio @access READ, UPDATE */
  bio?: string;

  /** URL to the user's profile picture. @property {String} avatarURL @access READ, UPDATE */
  avatarURL?: string;

  /** Flag indicating if the profile is active and visible. @property {Boolean} isActive @access READ, UPDATE */
  isActive?: boolean;

  /** Flag indicating if the profile is the default for this user's identity. @property {Boolean} isActive @access READ, UPDATE */
  isDefault?: boolean;

  /** User's Identity.Status - controls if this identity is active, pending, trashed. @property {Enum} sex - One of: active, pending @access READ, UPDATE */
  status?: 'pending' | 'active' | 'locked' | 'disabled';

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * SignupAttempt model interface
 * Generated from backend schema
 */
export interface SignupAttempt {
  /** Unique identifier for the registration attempt. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** System-level owner of this signup attempt (typically SECURITY actor). @property {UUID} ownerId - Foreign key to system profile @access READ, UPDATE, CREATE */
  ownerId?: string;

  /** Email address being registered. @property {String} email @access READ, CREATE @required for creation */
  email: string;

  /** Status of the registration attempt. @property {String} status - pending | verified | failed | expired @access READ, UPDATE, CREATE */
  status: 'pending' | 'verified' | 'expired' | 'failed';

  /** When the registration was verified. @property {Date} verifiedAt @access READ, UPDATE */
  verifiedAt?: Date;

  /** Identity created by this registration, if applicable. @property {UUID} identityId @access READ, UPDATE, CREATE */
  identityId?: string;

  /** Account created by this registration, if applicable. @property {UUID} identityId @access READ, UPDATE, CREATE */
  accountId?: string;

  /** Profile created by this registration, if applicable. @property {UUID} profileId @access READ, UPDATE, CREATE */
  profileId?: string;

  inviteId?: string;

  /** Optional failure reason if the registration failed. @property {String} failureReason @access READ, UPDATE */
  failureReason?: string;

  /** Arbitrary extra data. @property {JSONB} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  /** IP address of the user registering (for security tracking and jurisdiction detection). @property {String} ipAddress - IPv4 or IPv6 address @access READ, UPDATE, CREATE @required for creation */
  ipAddress: string;

  /** True if the user has acknowledged terms and conditions. @property {Boolean} acknowledgedTerms @access READ, CREATE */
  acknowledgedTerms: boolean;

  /** True if the user has acknowledged they meet age requirements. @property {Boolean} acknowledgedAge @access READ, CREATE */
  acknowledgedAge?: boolean;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * AuditEvent model interface
 * Generated from backend schema
 */
export interface AuditEvent {
  /** Unique identifier for the audit event record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The system profile that owns this audit event record. Typically the domain system actor for the resource being audited. @property {UUID} ownerId - Foreign key to profile @access READ only @required for creation */
  ownerId: string;

  /** The profile that performed the mutation. Nullable for system-initiated operations where no human actor is involved (e.g. bootstrap, migrations). @property {UUID} actorId - Foreign key to profile @access READ only */
  actorId?: string;

  /** Whether the actor was a human profile or an automated system process. @property {string} actorType - One of ACTOR_TYPES values @access READ only @required for creation */
  actorType: 'system' | 'actor';

  /** The mutation operation that was performed on the resource. Maps directly to ACTIONS constants (create, update, delete, etc.). @property {string} action - One of ACTIONS values @access READ only @required for creation */
  action: 'create' | 'read' | 'update' | 'remove' | 'restore' | 'delete' | 'add_association' | 'remove_association' | 'share' | 'create_failed' | 'update_failed';

  /** The model name of the resource that was mutated (e.g. 'role', 'profile'). @property {string} resourceType - Model name of the affected resource @access READ only @required for creation */
  resourceType: string;

  /** UUIDs of all records affected by the operation. Single-record operations store a one-element array; bulk operations store all affected IDs. Indexed with GIN for efficient ANY() queries. @property {string[]} resourceIds - Array of affected record UUIDs @access READ only @required for creation */
  resourceIds: unknown[];

  /** The normalized IP address of the request that triggered the mutation. @property {string} ipAddress - IPv4 or IPv6 address @access READ only */
  ipAddress?: string;

  /** The user agent string of the client that triggered the mutation. @property {string} userAgent - Browser or client user agent @access READ only */
  userAgent?: string;

  /** Additional unstructured data relevant to the event. For experimentation or edge-case context only — not a primary data store. @property {Object} metadata - Optional JSON payload @access READ only */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * SecurityEvent model interface
 * Generated from backend schema
 */
export interface SecurityEvent {
  /** Unique identifier for the security event record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The system profile that owns this security event record. Typically the security domain system actor. @property {UUID} ownerId - Foreign key to profile @access READ only @required for creation */
  ownerId: string;

  /** The profile that triggered the event. Nullable for system-initiated events where no human actor is involved (e.g. token expiry, scheduled cleanup). @property {UUID} actorId - Foreign key to profile @access READ only */
  actorId?: string;

  /** Whether the actor was a human profile or an automated system process. @property {string} actorType - One of ACTOR_TYPES values @access READ only @required for creation */
  actorType: 'system' | 'actor';

  /** The type of security event that occurred. @property {string} eventType - One of SECURITY_EVENTS values @access READ only @required for creation */
  eventType: 'login' | 'token_refresh' | 'token_validate' | 'logout' | 'verification' | 'password_reset' | 'password_reset_request' | 'switch_profile' | 'signup' | 'permission' | 'rate_limit' | 'data_retention' | 'invite';

  /** The normalized IP address from which the event originated. @property {string} ipAddress - IPv4 or IPv6 address @access READ only */
  ipAddress?: string;

  /** The user agent string of the client that triggered the event. @property {string} userAgent - Browser or client user agent @access READ only */
  userAgent?: string;

  /** HTTP method of the request that triggered the event (e.g. GET, POST). @property {string} method @access READ only */
  method?: string;

  /** Request path including query string. @property {string} path @access READ only */
  path?: string;

  /** HTTP status code of the response sent to the client. @property {number} statusCode @access READ only */
  statusCode?: number;

  /** The resolved permission name that was checked (e.g. can_create_role). @property {string} permission @access READ only */
  permission?: string;

  /** The model name of the resource involved in the event (e.g. role, profile). @property {string} resourceType @access READ only */
  resourceType?: string;

  /** UUIDs of the records involved in the event. Single-record events store a one-element array; denials on batch operations store all denied IDs. @property {string[]} resourceIds @access READ only */
  resourceIds?: unknown[];

  /** Human-readable reason for the event — sourced from err.message at the throw site. @property {string} reason @access READ only */
  reason?: string;

  /** Additional unstructured data relevant to the event. For experimentation or edge-case context only — not a primary data store. @property {Object} metadata - Optional JSON payload @access READ only */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * ViewEvent model interface
 * Generated from backend schema
 */
export interface ViewEvent {
  /** Unique identifier for the view event record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The system profile that owns this view event record. Typically the domain system actor for the resource being viewed. @property {UUID} ownerId - Foreign key to profile @access READ only @required for creation */
  ownerId: string;

  /** The profile that performed the read. Nullable for system-initiated reads where no human actor is involved. @property {UUID} actorId - Foreign key to profile @access READ only */
  actorId?: string;

  /** Whether the actor was a human profile or an automated system process. @property {string} actorType - One of ACTOR_TYPES values @access READ only @required for creation */
  actorType: 'system' | 'actor';

  /** Whether this was a single-record read or a collection list. 'read' = findById/findOne with one resource. 'list' = findAll with N resources. @property {string} action - One of VIEW_ACTION values @access READ only @required for creation */
  action: 'read' | 'list';

  /** The model name of the resource that was viewed (e.g. 'role', 'profile'). @property {string} resourceType - Model name of the viewed resource @access READ only @required for creation */
  resourceType: string;

  /** UUIDs of all records returned in this read operation. Single-record reads store a one-element array; list reads store all returned IDs. Indexed with GIN for efficient ANY() queries. @property {string[]} resourceIds - Array of viewed record UUIDs @access READ only @required for creation */
  resourceIds: unknown[];

  /** The normalized IP address of the request that triggered the read. @property {string} ipAddress - IPv4 or IPv6 address @access READ only */
  ipAddress?: string;

  /** The user agent string of the client that triggered the read. @property {string} userAgent - Browser or client user agent @access READ only */
  userAgent?: string;

  /** Additional unstructured data relevant to the event. For experimentation or edge-case context only — not a primary data store. @property {Object} metadata - Optional JSON payload @access READ only */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * BusinessRule model interface
 * Generated from backend schema
 */
export interface BusinessRule {
  /** Unique identifier for the businessRuleSet constant record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns/edits this constant (admin scope). @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The subscription tier this constant is aimed at. Uses -1 as sentinel value for global/universal tier. */
  accountTypeLevel: number;

  /** The country code this constant applies to. If undefined, the system defaults to global. */
  countryCode?: string;

  /** The subdivision code this constant applies to. Full ISO 3166-2 code (e.g., AU-VIC, US-CA, GB-ENG). */
  subdivisionCode?: string;

  type: 'limit' | 'dataRetention' | 'verification';

  service: string;

  serviceAssociation?: string;

  operations: unknown[];

  /** JSON value bound to the key. Enforced by the service/publisher based on namespace: @property {JSON} value - BusinessRuleSet value payload @access READ, UPDATE, CREATE @required for creation */
  value: Record<string, unknown>;

  /** BusinessRule.Status - controls if this BusinessRule should be included in config. @property {Enum} status - One of: include, pending, revoked @access READ, UPDATE, CREATE */
  status?: 'include' | 'pending' | 'revoked';

  /** Human description for Admin UI and audits. @property {String} description @access READ, UPDATE, CREATE */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * BusinessRuleSet model interface
 * Generated from backend schema
 */
export interface BusinessRuleSet {
  /** Unique identifier for the bundle. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns/edits this constant (admin scope). @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The profile that performed the publish. @property {UUID} publishedBy - Foreign key to profile @access READ, CREATE @required for creation */
  publishedById?: string;

  /** Bundle lifecycle status. One of: pending, active, archived. @property {Enum} status @access READ, UPDATE, CREATE */
  status?: 'published' | 'pending' | 'archived';

  /** Monotonic version number assigned at publish time. @property {Integer} version - Unique version for this bundle @access READ, CREATE @required for creation */
  version: number;

  /** The compiled businessRuleSet artifact consumed by BusinessRuleSetEngine. Shape example: { tier: { "0": { base:{limits}, countryDiff:{ AU:{...} } } }, verification: { requiredFor: { "program.create": { ageVerified: true } } } } @property {JSON} bundle @access READ, CREATE @required for creation */
  bundle?: Record<string, unknown>;

  /** Publish timestamp (UTC). @property {Date} publishedAt @access READ, CREATE @required for creation */
  publishedAt?: Date;

  /** Optional notes for audit/ops (e.g., release name or changelog URL). @property {String} notes @access READ, UPDATE, CREATE */
  notes?: string;

  /** Optional, non-enforcing metadata for diagnostics / labels / ops notes. Not read by BusinessRuleSetEngine for enforcement. Editable post-publish. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Invite model interface
 * Generated from backend schema
 */
export interface Invite {
  /** Unique identifier for the invite record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this invite. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The email where the invitation is being set. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  email: string;

  /** The version of the token. This is used for token invalidation on resend. @property {Number} tokenVersion - the version of the token. @access READ, UPDATE */
  tokenVersion?: number;

  /** Classification of the invite, determining how it is consumed on acceptance. @property {String} type - Invite type discriminator @access READ, UPDATE, CREATE @required for creation */
  type: string;

  /** Destination the recipient is directed to when redeeming the invite. @property {String} targetUrl - Redemption target URL @access READ, UPDATE, CREATE @required for creation */
  targetUrl: string;

  /** Arbitrary payload carried by the invite and applied on acceptance. @property {Object} context - Invite context payload @access READ, UPDATE, CREATE @required for creation */
  context: Record<string, unknown>;

  /** Current lifecycle status of the invite. @property {String} status - One of InviteModel.statuses @access READ, UPDATE, CREATE */
  status?: 'pending' | 'accepted' | 'expired' | 'revoked';

  /** Point in time after which the invite can no longer be redeemed. @property {Date} expiresAt - Invite expiry timestamp @access READ, UPDATE, CREATE @required for creation */
  expiresAt: Date;

  /** Point in time the invite was accepted, if it has been. @property {Date} acceptedAt - Acceptance timestamp @access READ, UPDATE */
  acceptedAt?: Date;

  /** Point in time the invite was revoked, if it has been. @property {Date} revokedAt - Revocation timestamp @access READ, UPDATE */
  revokedAt?: Date;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Membership model interface
 * Generated from backend schema
 */
export interface Membership {
  /** Unique identifier for the membership. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this membership record. Typically the owner/admin of the resource being joined. @property {UUID} ownerId - Foreign key to profile owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The profile that is a member of the resource. @property {UUID} profileId - Foreign key to member profile @access READ, UPDATE, CREATE @required for creation */
  profileId: string;

  /** The membership type this membership grants (e.g. owner, member, viewer). @property {UUID} membershipTypeId - Foreign key to membershipType @access READ, UPDATE, CREATE @required for creation */
  membershipTypeId: string;

  /** Polymorphic type identifier (e.g., 'account', 'community', 'chat') @property {String} memberOfType - Resource type @access READ, UPDATE, CREATE @required for creation */
  memberOfType: string;

  /** ID of the resource being joined @property {UUID} memberOfId - Target resource ID @access READ, UPDATE, CREATE @required for creation */
  memberOfId: string;

  /** Profile who created the membership (invited or approved) @property {UUID} invitedById - Inviter profile ID @access READ, UPDATE, CREATE */
  invitedById?: string;

  /** When the invitation was sent @property {Date} invitedAt - Invitation timestamp @access READ, UPDATE, CREATE */
  invitedAt?: Date;

  /** When the membership became active @property {Date} joinedAt - Join timestamp @access READ, UPDATE, CREATE */
  joinedAt?: Date;

  /** Current status of the membership @property {Enum} status - Membership status @access READ, UPDATE, CREATE */
  status?: 'pending' | 'active' | 'inactive' | 'disabled';

  /** Optional metadata for the membership @property {JSONB} metadata - Additional metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * MembershipType model interface
 * Generated from backend schema
 */
export interface MembershipType {
  /** Unique identifier for the membership type record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this membership type. @property {UUID} ownerId - Foreign key to account @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Unique membership type name identifier (e.g., owner, member, viewer). @property {String} label - Unique membership type name @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** Human description for Admin UI and audits. @property {String} description @access READ, UPDATE, CREATE */
  description?: string;

  /** The role bundle this membership type grants. @property {UUID} roleBundleId - Foreign key to roleBundle @access READ, UPDATE, CREATE @required for creation */
  roleBundleId: string;

  /** Arbitrary structured metadata for this membership type. @property {Object} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Message model interface
 * Generated from backend schema
 */
export interface Message {
  /** Unique identifier for the message. @property {UUID} id - Primary key. @access READ */
  id?: string;

  /** The profile that owns this message. @property {UUID} ownerId - Foreign key to profile. @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The sender of the message. @property {UUID} senderId - Foreign key to profile. @access READ, UPDATE, CREATE @required for creation */
  senderId: string;

  /** The receiver of the message. @property {UUID} receiverId - Foreign key to profile. @access READ, UPDATE, CREATE @required for creation */
  receiverId: string;

  /** Channel used to send the message (e.g., 'mail', 'sms', 'push', 'chat'). @property {('mail'|'sms'|'push'|'chat')} channel - One of MessageModel.channels. @access READ, UPDATE, CREATE */
  channel: 'mail' | 'sms' | 'push' | 'chat';

  /** The message type (links to MessageType model). @property {UUID} type - Foreign key to messageType. @access READ, UPDATE, CREATE @required for creation */
  type: string;

  /** Optional subject of the message (used in email, etc). @property {string} subject - Max 255 characters. @access READ, UPDATE, CREATE */
  subject?: string;

  /** The message payload (DSL content as JSON). @property {JSONB} payload - Normalized DSL structure. @access READ, UPDATE, CREATE */
  payload?: Record<string, unknown>;

  /** Current delivery status of the message. @property {('queued'|'sending'|'delivered'|'failed')} status - One of MessageModel.statuses. @access READ, UPDATE, CREATE */
  status?: 'queued' | 'sending' | 'delivered' | 'failed';

  /** Number of delivery attempts made for this message. @property {integer} deliveryAttempts @access READ, UPDATE, CREATE */
  deliveryAttempts?: number;

  /** Timestamp of the last delivery attempt. @property {Date} lastAttemptAt @access READ, UPDATE, CREATE */
  lastAttemptAt?: Date;

  /** When the message should be sent. @property {Date} lastAttemptAt @access READ, UPDATE, CREATE */
  sendAt: Date;

  /** Timestamp when the message was successfully delivered. @property {Date} deliveredAt @access READ, UPDATE, CREATE */
  deliveredAt?: Date;

  /** The failure cause for messages being marked with a failed status. @property {string} error @access READ, UPDATE, CREATE */
  error?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * MessageType model interface
 * Generated from backend schema
 */
export interface MessageType {
  /** Unique identifier for the messageType. @property {UUID} id - Primary key. @access READ */
  id?: string;

  /** The profile that owns this messageType. @property {UUID} ownerId - Foreign key to profile. @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The unique name of this message type (used to categorise messages). Example: 'account_verification', 'order_confirmation', etc. @property {string} name - Unique identifier for message type. @access READ, UPDATE, CREATE @required for creation */
  name: string;

  /** Optional description of this message type. Used for admin UIs or system audit. @property {string} description - Optional description (max 1000 chars). @access READ, UPDATE, CREATE */
  description?: string;

  /** Whether this message type is active and available for use. Inactive types cannot be selected when sending messages. @property {boolean} isActive @access READ, UPDATE, CREATE */
  isActive?: boolean;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Country model interface
 * Generated from backend schema
 */
export interface Country {
  /** Unique identifier for the country record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this country record. @property {UUID} ownerId - Foreign key to profile owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** ISO 3166-1 alpha-2 country code (e.g., AU, NZ, GB, US). @property {String} code - Unique country code @access READ, UPDATE, CREATE @required for creation */
  code: string;

  /** ISO 3166-1 alpha-3 country code (e.g., AUS, NZL, GBR, USA). @property {String} alpha3 - Three-letter country code @access READ, UPDATE, CREATE @required for creation */
  alpha3: string;

  /** ISO 3166-1 numeric country code (e.g., 036, 554, 826, 840). Stored as string to preserve leading zeros. @property {String} numericCode - Three-digit numeric country code @access READ, UPDATE, CREATE @required for creation */
  numericCode: string;

  /** Human-readable display label for the country. @property {String} label - Country display name @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** The region this country belongs to for operational grouping. @property {UUID} regionId - Foreign key to region @access READ, UPDATE, CREATE @required for creation */
  regionId?: string;

  /** Default currency for this country. @property {UUID} currencyId - Foreign key to currency @access READ, UPDATE, CREATE @required for creation */
  currencyId?: string;

  /** Default language for this country. @property {UUID} languageId - Foreign key to language @access READ, UPDATE, CREATE @required for creation */
  languageId?: string;

  /** True if this country is supported by the app, otherwise false. @property {Boolean} isSupported - True if this country is supported by the app, otherwise false. @access READ, UPDATE, CREATE */
  isSupported?: boolean;

  /** Optional metadata for diagnostics, labels, or operational notes. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Currency model interface
 * Generated from backend schema
 */
export interface Currency {
  /** Unique identifier for the currency record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this currency. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Unique currency code identifier (e.g., AUD, USD). @property {String} code - Unique currency code @access READ, UPDATE, CREATE @required for creation */
  code: string;

  /** Currency symbol for display purposes. @property {String} symbol - Currency symbol @access READ, UPDATE, CREATE */
  symbol?: string;

  /** Human-readable name of the currency. @property {String} label - Currency display name @access READ, UPDATE, CREATE @required for creation */
  label: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Language model interface
 * Generated from backend schema
 */
export interface Language {
  /** Unique identifier for the language record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this language. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Unique language code identifier (e.g., en-AU, en-US). @property {String} code - Unique language code @access READ, UPDATE, CREATE @required for creation */
  code: string;

  /** Human-readable name of the language. @property {String} label - Language display name @access READ, UPDATE, CREATE @required for creation */
  label: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Region model interface
 * Generated from backend schema
 */
export interface Region {
  /** Unique identifier for the region record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this region. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Unique region code identifier (e.g., AU, US, EU). @property {String} code - Unique region code @access READ, UPDATE, CREATE @required for creation */
  code: string;

  /** Human-readable display label for the region. @property {String} label - Region display name/label @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** Optional, non-enforcing metadata for diagnostics / labels / ops notes. Not read by BusinessRuleSetEngine for enforcement. Editable post-publish. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Subdivision model interface
 * Generated from backend schema
 */
export interface Subdivision {
  /** Unique identifier for the subdivision record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this subdivision record. @property {UUID} ownerId - Foreign key to profile owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Full ISO 3166-2 code (e.g., AU-VIC, US-CA, GB-ENG). Used as the key for businessRuleSet resolution. @property {String} code - Unique subdivision code @access READ, UPDATE, CREATE @required for creation */
  code: string;

  /** Local subdivision code without country prefix (e.g., VIC, CA, ENG). @property {String} subdivisionCode - Local subdivision identifier @access READ, UPDATE, CREATE @required for creation */
  subdivisionCode: string;

  /** Human-readable display label for the subdivision. @property {String} label - Subdivision display name (e.g., Victoria, California) @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** The country this subdivision belongs to. @property {UUID} countryId - Foreign key to country @access READ, UPDATE, CREATE @required for creation */
  countryId: string;

  /** True if this subdivision is supported by the app, otherwise false. @property {Boolean} isSupported - True if this subdivision is supported by the app, otherwise false. @access READ, UPDATE, CREATE */
  isSupported?: boolean;

  /** Optional metadata for diagnostics, labels, or operational notes. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * TaxRate model interface
 * Generated from backend schema
 */
export interface TaxRate {
  /** Unique identifier for the tax rate record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this tax rate record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** Country the tax rate applies to. @property {UUID} countryId - Foreign key to country @access READ, CREATE @required for creation */
  countryId: string;

  /** Subdivision the tax rate applies to. Undefined indicates the national default tax rate for the country. @property {UUID} subdivisionId - Foreign key to subdivision @access READ, CREATE */
  subdivisionId?: string;

  /** Human and system identifier for the tax rate. @property {String} code - Unique code within the owning account @access READ, CREATE, UPDATE @required for creation */
  code: string;

  /** Human-readable name of the tax rate. @property {String} name - Display name @access READ, CREATE, UPDATE */
  name?: string;

  /** Free-text description of the tax rate. @property {String} description - Description @access READ, CREATE, UPDATE */
  description?: string;

  /** Tax percentage stored as tenths of a basis point (10000 = 10.00%). @property {Number} rateBps - Tax rate in tenths of a basis point @access READ, CREATE, UPDATE @required for creation */
  rateBps: number;

  /** Date the tax rate becomes legally effective. @property {Date} effectiveFrom - Start of the effective range @access READ, CREATE, UPDATE @required for creation */
  effectiveFrom: Date;

  /** Date the tax rate ceases to be legally effective. Undefined indicates the rate is currently in force. @property {Date} effectiveTo - End of the effective range @access READ, CREATE, UPDATE */
  effectiveTo?: Date;

  /** Indicates the default tax rate for the jurisdiction. @property {Boolean} isDefault - Whether this is the jurisdiction default @access READ, CREATE, UPDATE */
  isDefault?: boolean;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * AppPreferences model interface
 * Generated from backend schema
 */
export interface AppPreferences {
  /** Unique identifier for the app preferences record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns these preferences. @property {UUID} ownerId - Foreign key to profile, unique @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Theme mode for the application UI. @property {String} themeMode - 'light' or 'dark' @access READ, UPDATE, CREATE @required for creation */
  themeMode: 'light' | 'dark';

  /** Theme name identifier for the application. @property {String} themeName - Theme identifier (e.g., 'BLUE_THEME') @access READ, UPDATE, CREATE @required for creation */
  themeName: string;

  /** Text direction for the application UI. @property {String} direction - 'ltr' (left-to-right) or 'rtl' (right-to-left) @access READ, UPDATE, CREATE @required for creation */
  direction: 'ltr' | 'rtl';

  /** Language for localization. @property {UUID} languageId - Foreign key to language @access READ, UPDATE, CREATE @required for creation */
  languageId: string;

  /** Currency for pricing display. @property {UUID} currencyId - Foreign key to currency @access READ, UPDATE, CREATE @required for creation */
  currencyId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Permission model interface
 * Generated from backend schema
 */
export interface Permission {
  /** Unique identifier for the permission record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this permission. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Name of the permission, used as a unique identifier in the system. @property {String} name - Unique permission name/identifier @access READ, UPDATE, CREATE @required for creation */
  name: string;

  /** Detailed description of the permission's purpose and scope. @property {String} description - Permission purpose description @access READ, UPDATE, CREATE */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * ResourceRole model interface
 * Generated from backend schema
 */
export interface ResourceRole {
  /** Unique identifier for the resourceRole record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this resource role assignment. Typically the system profile in the domain of the resource, i.e. security, training, etc.. @property {UUID} ownerId - Foreign key to profile owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The profile receiving the role. @property {UUID} profileId - Foreign key to recipient profile @access READ, UPDATE, CREATE @required for creation */
  profileId: string;

  /** The role being granted. @property {UUID} roleId - Foreign key to role @access READ, UPDATE, CREATE @required for creation */
  roleId: string;

  /** Discriminator naming which model `resourceId` points at. @property {Enum} ownerServiceType - One of: account, identity, profile @access READ, UPDATE, CREATE @required for creation */
  ownerServiceType: 'account' | 'identity' | 'profile';

  /** ID of the resource being accessed, resolved against `ownerServiceType`. The targets are the owner scopes RBAC assigns against — every model's `accessModel.ownerServiceType` is one of these three. An assignment is meaningless once the resource it scopes is gone, so it cascades. @property {UUID} resourceId - Target resource ID @access READ, UPDATE, CREATE @required for creation */
  resourceId: string;

  /** ID of the profile who assigned the role. @property {UUID} grantedById - Grantor profile ID @access READ, UPDATE, CREATE */
  grantedById?: string;

  /** When access begins (optional, useful for delayed start). @property {Date} startedAt - Start time @access READ, UPDATE, CREATE */
  startedAt: Date;

  /** When access ends (e.g., trial, time-limited access). @property {Date} expiresAt - Expiration time @access READ, UPDATE, CREATE */
  expiresAt?: Date;

  /** Soft-revoke flag — if false, this role is inactive but retained for audit/history purposes. @property {Boolean} isActive - Active status @access READ, UPDATE, CREATE */
  isActive?: boolean;

  /** Optional human-readable label (e.g., "invited", "auto_granted"). @property {String} contextLabel - Descriptive label @access READ, UPDATE, CREATE */
  contextLabel?: string;

  /** Arbitrary extra data (e.g., invite code, promo info). @property {JSONB} metadata - Additional metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Role model interface
 * Generated from backend schema
 */
export interface Role {
  /** Unique identifier for the role record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this role. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** Name of the role, used as a unique identifier in the system. @property {String} name - Unique role name/identifier @access READ, UPDATE, CREATE @required for creation */
  name: string;

  /** Display label for the role, used in UI elements. @property {String} label - Human-readable role label @access READ, UPDATE, CREATE */
  label?: string;

  /** The resource type this role is intended to be assigned against (e.g., 'profile', 'identity'). This informs the system which resource the role should be linked to when applied via roleBundles or direct assignment. It does not affect permission enforcement (which is handled by the access model), but enables safe, automated creation of resourceRole entries and prevents misconfiguration during bootstrap or runtime operations. @property {string} targetResourceType - The canonical service type name of the resource this role is bound to. @access READ, UPDATE, CREATE */
  targetResourceType?: string;

  /** Detailed description of the role's purpose and scope. @property {String} description - Role purpose description @access READ, UPDATE, CREATE */
  description?: string;

  /** Optional extensibility data for the role. @property {JSONB} metadata - Additional role metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * RoleBundle model interface
 * Generated from backend schema
 */
export interface RoleBundle {
  /** Unique identifier for the roleBundle. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this roleBundle. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The name of the role bundle. @property {String} name @access READ, UPDATE, CREATE @required for CREATE */
  name: string;

  /** The description of the role bundle. @property {String} name @access READ, UPDATE, CREATE @required for CREATE */
  description?: string;

  /** The version of the role bundle to assist with bundle rollout. @property {String} name @access READ, UPDATE, CREATE @required for CREATE */
  version?: number;

  /** Optional extensibility data for the roleBundle. @property {JSONB} metadata - Additional role metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * RoleBundleRole model interface
 * Generated from backend schema
 */
export interface RoleBundleRole {
  /** Unique identifier for the roleBundle record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the role. @property {UUID} roleId - Foreign key to role @access READ, UPDATE, CREATE @required for creation */
  roleId: string;

  /** Reference to the roleBundle. @property {UUID} roleBundleId - Foreign key to roleBundle @access READ, UPDATE, CREATE @required for creation */
  roleBundleId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * RolePermission model interface
 * Generated from backend schema
 */
export interface RolePermission {
  /** Unique identifier for the rolePermission record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the role. @property {UUID} roleId - Foreign key to role @access READ, UPDATE, CREATE @required for creation */
  roleId: string;

  /** Reference to the permission. @property {UUID} permissionId - Foreign key to permission @access READ, UPDATE, CREATE @required for creation */
  permissionId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * RefreshToken model interface
 * Generated from backend schema
 */
export interface RefreshToken {
  /** Unique identifier for the refresh token row. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** System-level owner of this refresh token (the SECURITY actor profile). Refresh tokens are security-domain artifacts, not user-domain — the system profile owns the row regardless of which identity it is for. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE */
  ownerId: string;

  /** The identity this refresh token was issued to. @property {UUID} identityId - Foreign key to identity @access READ, CREATE @required for creation */
  identityId: string;

  /** SHA-256 hex hash of the issued refresh JWT. Never store the raw token. @property {String} tokenHash - 64-char hex digest @access READ, CREATE @required for creation */
  tokenHash: string;

  /** When the refresh token expires (UTC timestamp). Mirrors the JWT `exp`. @property {Date} expiresAt @access READ, CREATE @required for creation */
  expiresAt: Date;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * VerificationCode model interface
 * Generated from backend schema
 */
export interface VerificationCode {
  /** Unique identifier for the verification code. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** System-level owner of this verification code (typically SECURITY actor). @property {UUID} ownerId - Foreign key to system profile @access READ, UPDATE, CREATE */
  ownerId: string;

  /** The profile that must verify this code (user being verified). @property {UUID} profileId - Foreign key to profile @access READ @required for creation */
  profileId: string;

  /** The 6-digit numeric verification code. @property {String} code - Exactly 6 characters @access READ @required for creation */
  code: string;

  /** The type/purpose of verification code (email, phone, 2FA, signup). @property {String} codeType - Must be one of VERIFICATION_TYPES @access READ @required for creation */
  codeType: 'signup' | 'email' | 'phone' | 'mfa' | 'password' | 'handle';

  /** When the verification code expires (UTC timestamp). @property {Date} expiresAt - Expiration timestamp in UTC @access READ @required for creation */
  expiresAt: Date;

  /** Number of failed verification attempts for this code. @property {number} attempts - Value between 0-5, defaults to 0 @access READ */
  attempts?: number;

  /** Current status of the verification code lifecycle. @property {Enum} status - One of: PENDING, VERIFIED, EXPIRED, REJECTED, REVOKED @access READ @required for creation */
  status: 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected' | 'revoked';

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * AccountType model interface
 * Generated from backend schema
 */
export interface AccountType {
  /** Unique identifier for the subscription tier record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this subscription tier. Optional on create so bootstrap can break the ownership cycle: accountType references profile, account references accountType, and profile references account. Account types are seeded first without an owner, then backfilled once the system profile exists. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE */
  ownerId?: string;

  /** Unique tier name identifier (e.g., basic, bronze, silver). @property {String} label - Unique tier name @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** Numeric level for ordering tiers (e.g., 0, 1, 2). @property {Integer} level - Tier ordering level @access READ, UPDATE, CREATE @required for creation */
  level: number;

  /** Human description for Admin UI and audits. @property {String} description @access READ, UPDATE, CREATE */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * FeatureFlag model interface
 * Generated from backend schema
 */
export interface FeatureFlag {
  /** Unique identifier for the feature flag record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns/administers this feature flag. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** Unique key identifier for the feature flag. @property {String} key - Unique feature flag key @access READ, CREATE @required for creation */
  key: string;

  /** Current status of the feature flag. @property {String} status - Feature flag status (pending, active, archived) @access READ, CREATE, UPDATE */
  status?: 'pending' | 'active' | 'archived';

  /** Account type level reference for feature flag targeting. @property {Integer} accountTypeLevelId - Foreign key to account_type @access READ, CREATE, UPDATE */
  accountTypeLevel?: number;

  /** Country code for geographic targeting. @property {String} countryCodeId - Foreign key to country @access READ, CREATE, UPDATE */
  countryCode?: string;

  /** Subdivision code for geographic targeting. @property {String} subdivisionCodeId - Foreign key to subdivision @access READ, CREATE, UPDATE */
  subdivisionCode?: string;

  /** Service identifier for feature flag categorization. @property {String} service - Service name @access READ, CREATE, UPDATE */
  service?: string;

  /** Service association for feature flag targeting. @property {String} serviceAssociation - Service association @access READ, CREATE, UPDATE */
  serviceAssociation?: string;

  /** Rollout percentage for gradual feature deployment. @property {Integer} rolloutPercentage - Percentage value (0-100) @access READ, CREATE, UPDATE */
  rolloutPercentage?: number;

  /** Flag to indicate if this feature flag is killed. @property {Boolean} killed - Kill status @access READ, CREATE, UPDATE */
  killed?: boolean;

  /** Fallback result used when all feature flag evaluators abstain. Example: - accountAllowlist → ABSTAIN - percentage → ABSTAIN - defaultResult = EXCLUDE - final result = EXCLUDE Typical usage: - INCLUDE → feature enabled by default unless explicitly excluded - EXCLUDE → feature disabled by default unless explicitly included @property {String} defaultResult - One of: INCLUDE, EXCLUDE @access READ, CREATE, UPDATE */
  defaultResult?: 'INCLUDE' | 'EXCLUDE';

  /** Variant and configuration payloads in JSONB format. @property {Object} value - JSONB configuration value @access READ, CREATE, UPDATE */
  value?: Record<string, unknown>;

  /** Detailed description of the feature flag's purpose. @property {String} description - Feature flag description @access READ, CREATE, UPDATE */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * FeatureFlagAccount model interface
 * Generated from backend schema
 */
export interface FeatureFlagAccount {
  /** Unique identifier for the featureFlagAccount record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the feature flag. @property {UUID} featureFlagId - Foreign key to featureFlag @access READ, UPDATE, CREATE @required for creation */
  featureFlagId: string;

  /** Reference to the account. @property {UUID} accountId - Foreign key to account @access READ, UPDATE, CREATE @required for creation */
  accountId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * FeatureFlagProfile model interface
 * Generated from backend schema
 */
export interface FeatureFlagProfile {
  /** Unique identifier for the featureFlagProfile record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** Reference to the feature flag. @property {UUID} featureFlagId - Foreign key to featureFlag @access READ, UPDATE, CREATE @required for creation */
  featureFlagId: string;

  /** Reference to the profile. @property {UUID} profileId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  profileId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * FeatureFlagSet model interface
 * Generated from backend schema
 */
export interface FeatureFlagSet {
  /** Unique identifier for the featureFlagSet record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this featureFlagSet. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The profile that performed the publish. @property {UUID} publishedById - Foreign key to profile @access READ, CREATE */
  publishedById?: string;

  /** Lifecycle status of the bundle. @property {String} status - One of: pending, published, archived @access READ, UPDATE, CREATE */
  status?: 'published' | 'pending' | 'archived';

  /** Monotonic version number assigned at publish time. @property {Integer} version - Unique version for this bundle @access READ, CREATE @required for creation */
  version: number;

  /** Compiled feature flag artifact consumed by FeatureFlagEngine at runtime. @property {JSON} bundle @access READ, CREATE */
  bundle?: Record<string, unknown>;

  /** Timestamp when this bundle was published to ACTIVE. @property {Date} publishedAt @access READ, CREATE */
  publishedAt?: Date;

  /** Optional notes for audit/ops (e.g., release name or changelog URL). @property {String} notes @access READ, UPDATE, CREATE */
  notes?: string;

  /** Optional, non-enforcing metadata for diagnostics / labels / ops notes. Not read by FeatureFlagEngine for enforcement. Editable post-publish. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * State model interface
 * Generated from backend schema
 */
export interface State {
  /** Unique identifier for the state record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this state (system-owned). @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The state category that drives the display color for this state. @property {UUID} stateCategoryId - Foreign key to stateCategory @access READ, UPDATE, CREATE @required for creation */
  stateCategoryId: string;

  /** Stable identifier for this state, in snake_case. This is the translation key, and it is deliberately not derived from `name`. `name` is presentation text and may be rewritten freely — renaming a state must not silently repoint every translation that referred to it. Same contract the type catalogs use. @property {String} label - snake_case identifier @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** Display name for this state. @property {String} name - Human-readable state label @access READ, UPDATE, CREATE @required for creation */
  name: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * StateCategory model interface
 * Generated from backend schema
 */
export interface StateCategory {
  id?: string;

  /** Always the security actor (Athena). Set on create, never updated. */
  ownerId: string;

  name: string;

  /** Hex colour code for UI display (e.g. #3B82F6). */
  color?: string;

  /** Human-readable description of this stateCategory for display in the UI. */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * StateGraph model interface
 * Generated from backend schema
 */
export interface StateGraph {
  /** Unique identifier for the state graph record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this state graph. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** Stable identifier for this state graph, in snake_case. This is the translation key, and it is deliberately not derived from `name`. `name` is presentation text and may be rewritten freely — renaming a graph must not silently repoint every translation that referred to it. Same contract the type catalogs use. @property {String} label - snake_case identifier @access READ, CREATE, UPDATE @required for creation */
  label: string;

  /** The human-readable name of this workflow graph. @property {String} name - Unique graph name @access READ, CREATE, UPDATE @required for creation */
  name: string;

  /** Optional description of the graph's purpose and scope. @property {String} description @access READ, CREATE, UPDATE */
  description?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * StateGraphState model interface
 * Generated from backend schema
 */
export interface StateGraphState {
  /** Unique identifier for this record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this record (system-owned). @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** The state graph this record belongs to. @property {UUID} stateGraphId - Foreign key to stateGraph @access READ, CREATE @required for creation */
  stateGraphId: string;

  /** The canonical state node this record represents within the graph. @property {UUID} stateId - Foreign key to state @access READ, CREATE @required for creation */
  stateId: string;

  /** Display position of this state within its graph. @property {Integer} sortOrder - Ascending display order @access READ, UPDATE, CREATE @required for creation */
  sortOrder: number;

  /** Indicates whether this state is a terminal node in the graph. Terminal states have no valid outbound transitions. @property {Boolean} isTerminal - True if no transitions follow this state @access READ, UPDATE, CREATE @required for creation */
  isTerminal: boolean;

  /** Indicates whether this is the default state assigned when an entity first enters this graph. Exactly one StateGraphState per graph should have isDefault=true — enforced at the service layer. @property {Boolean} isDefault - True if this is the initial state @access READ, UPDATE, CREATE @required for creation */
  isDefault: boolean;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Transition model interface
 * Generated from backend schema
 */
export interface Transition {
  /** Unique identifier for the transition record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this transition. @property {UUID} ownerId - Foreign key to profile @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The state graph this transition belongs to. @property {UUID} stateGraphId - Foreign key to stateGraph @access READ, UPDATE, CREATE @required for creation */
  stateGraphId: string;

  /** Stable identifier for this transition, in snake_case. This is the translation key, and it is deliberately not derived from `name`. `name` is presentation text and may be rewritten freely — renaming a transition must not silently repoint every translation that referred to it. Same contract the type catalogs use. @property {String} label - snake_case identifier @access READ, UPDATE, CREATE @required for creation */
  label: string;

  /** Human-readable name for this transition. @property {String} name - Transition name @access READ, UPDATE, CREATE @required for creation */
  name: string;

  /** The state this transition originates from. Omitted for universal transitions that can fire from any state. @property {UUID} fromStateId - Foreign key to state (source) @access READ, UPDATE, CREATE */
  fromStateGraphStateId?: string;

  /** The state this transition leads to. @property {UUID} toStateId - Foreign key to state (destination) @access READ, UPDATE, CREATE @required for creation */
  toStateGraphStateId: string;

  /** Marks this as the bootstrap entry transition for the graph. Exactly one transition per graph should have isEntry=true — enforced at the service layer. Entry transitions have no fromStateGraphStateId and are invoked only by StateGraphService.start(). They are excluded from getAvailableTransitions() so actors cannot manually invoke them once an entity has already been started. @property {Boolean} isEntry - True if this is the initial bootstrap transition @access READ, UPDATE, CREATE @required for creation */
  isEntry: boolean;

  /** Registered hook identifiers to invoke when entering this transition. @property {String[]} onEnterHooks - Array of registered hook names @access READ, UPDATE, CREATE */
  onEnterHooks?: unknown[];

  /** Registered hook identifiers to invoke when exiting this transition. @property {String[]} onExitHooks - Array of registered hook names @access READ, UPDATE, CREATE */
  onExitHooks?: unknown[];

  /** Registered condition identifiers that must be satisfied for this transition. @property {String[]} conditions - Array of registered condition names @access READ, UPDATE, CREATE */
  conditions?: unknown[];

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * TransitionEvent model interface
 * Generated from backend schema
 */
export interface TransitionEvent {
  /** Unique identifier for the transition event record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this transition event. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE, UPDATE @required for creation */
  ownerId: string;

  /** The type of entity this transition event applies to (e.g. batch, inventory). @property {String} entityType - Entity type identifier @access READ, CREATE, UPDATE @required for creation */
  entityType: string;

  /** The ID of the specific entity this transition event applies to. @property {UUID} entityId - Foreign key to the entity @access READ, CREATE, UPDATE @required for creation */
  entityId: string;

  /** The transition that was executed. @property {UUID} transitionId - Foreign key to transition @access READ, CREATE, UPDATE @required for creation */
  transitionId: string;

  /** The state the entity transitioned from. Omitted for universal transitions that fire from any state (e.g. initial state entry). @property {UUID} fromStateId - Foreign key to state @access READ, CREATE, UPDATE */
  fromStateGraphStateId?: string;

  /** The state the entity transitioned to. @property {UUID} toStateId - Foreign key to state @access READ, CREATE, UPDATE @required for creation */
  toStateGraphStateId: string;

  /** The profile that triggered this transition event. @property {UUID} triggeredBy - Foreign key to profile @access READ, CREATE, UPDATE @required for creation */
  triggeredBy: string;

  /** Timestamp of when the transition occurred. @property {DateTime} occurredAt - Audit timestamp @access READ, CREATE @required for creation */
  occurredAt: Date;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Address model interface
 * Generated from backend schema
 */
export interface Address {
  /** Unique identifier for the address record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this address record. @property {UUID} ownerId - Foreign key to account owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The country for this address. @property {UUID} countryId - Foreign key to country @access READ, UPDATE, CREATE @required for creation */
  countryId: string;

  /** The subdivision (state/province) for this address. @property {UUID} subdivisionId - Foreign key to subdivision @access READ, UPDATE, CREATE @optional */
  subdivisionId?: string;

  /** City name. @property {String} city @access READ, UPDATE, CREATE @optional */
  city?: string;

  /** Postal or ZIP code. @property {String} postalCode @access READ, UPDATE, CREATE @optional */
  postalCode?: string;

  /** Street address line 1. @property {String} line1 @access READ, UPDATE, CREATE @optional */
  line1?: string;

  /** Street address line 2. @property {String} line2 @access READ, UPDATE, CREATE @optional */
  line2?: string;

  /** Optional label for this address. @property {String} label - e.g., "Home", "Work", "Billing" @access READ, UPDATE, CREATE @optional */
  label?: string;

  /** Optional metadata for diagnostics or operational notes. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * AddressType model interface
 * Generated from backend schema
 */
export interface AddressType {
  /** Unique identifier for the address type record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The system security profile that owns this reference record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** Descriptive label for the address type (e.g. Billing, Shipping, Facility). Must be unique across the system catalog. @property {String} label - Address type classification @access READ, CREATE, UPDATE @required for creation */
  label: string;

  /** Extended description of this address type. @property {String} description - Human-readable address type description @access READ, CREATE, UPDATE */
  description?: string;

  /** Icon identifier for UI display. @property {String} icon - Visual identifier for this address type @access READ, CREATE, UPDATE */
  icon?: string;

  /** Arbitrary metadata attached to this address type. @property {Object} metadata - Flexible metadata store @access READ, CREATE, UPDATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * Company model interface
 * Generated from backend schema
 */
export interface Company {
  /** Unique identifier for the company record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this company record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** Display name for this company. @property {String} name - Human-readable company name @access READ, CREATE, UPDATE @required for creation */
  name: string;

  /** Icon identifier for UI display. @property {String} icon - Visual identifier for this company @access READ, CREATE, UPDATE */
  icon?: string;

  /** Company website URL. @property {String} websiteUrl - Website address @access READ, CREATE, UPDATE */
  websiteUrl?: string;

  /** The format/type of the tax identifier. @property {String} taxIdentifierType - Enum value: abn, ein, vat, gst, company_number @access READ, CREATE, UPDATE */
  taxIdentifierType?: 'abn' | 'ein' | 'vat' | 'gst' | 'company_number';

  /** Raw tax identifier value (e.g. "12 345 678 901"). @property {String} taxIdentifier - Tax identifier value @access READ, CREATE, UPDATE */
  taxIdentifier?: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * CompanyAddress model interface
 * Generated from backend schema
 */
export interface CompanyAddress {
  /** Unique identifier for the company address record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this company address. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** The company linked to this address version. @property {UUID} companyId - Foreign key to company @access READ, CREATE, UPDATE @required for creation */
  companyId: string;

  /** The address version for this company. @property {UUID} addressId - Foreign key to address @access READ, CREATE, UPDATE @required for creation */
  addressId: string;

  /** The address type classification. @property {UUID} addressTypeId - Foreign key to addressType @access READ, CREATE, UPDATE @required for creation */
  addressTypeId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Location model interface
 * Generated from backend schema
 */
export interface Location {
  /** Unique identifier for the location record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this location record. @property {UUID} ownerId - Foreign key to account owner @access READ, UPDATE, CREATE @required for creation */
  ownerId: string;

  /** The external company this location is associated with. @property {UUID} companyId - Foreign key to company @access READ, CREATE, UPDATE @required for creation */
  companyId: string;

  /** The location type for this location. @property {UUID} locationTypeId - Foreign key to locationType @access READ, UPDATE, CREATE @required for creation */
  locationTypeId: string;

  /** Label for this location. @property {String} label - e.g., "Main Warehouse", "Office", "Market Stall A" @access READ, UPDATE, CREATE @optional */
  label?: string;

  /** Optional description of this location. @property {String} description @access READ, UPDATE, CREATE @optional */
  description?: string;

  /** Optional metadata for diagnostics or operational notes. @property {JSON} metadata @access READ, UPDATE, CREATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * LocationAddress model interface
 * Generated from backend schema
 */
export interface LocationAddress {
  /** Unique identifier for the location address record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this location address. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** The location linked to this address version. @property {UUID} locationId - Foreign key to location @access READ, CREATE, UPDATE @required for creation */
  locationId: string;

  /** The address version for this location. @property {UUID} addressId - Foreign key to address @access READ, CREATE, UPDATE @required for creation */
  addressId: string;

  /** The address type classification. @property {UUID} addressTypeId - Foreign key to addressType @access READ, CREATE, UPDATE @required for creation */
  addressTypeId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * LocationType model interface
 * Generated from backend schema
 */
export interface LocationType {
  /** Unique identifier for the location type record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The system security profile that owns this reference record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** Descriptive label for the location type (e.g. Warehouse, Office, Manufacturing). Must be unique across the system catalog. @property {String} label - Location type classification @access READ, CREATE, UPDATE @required for creation */
  label: string;

  /** Extended description of this location type. @property {String} description - Human-readable location type description @access READ, CREATE, UPDATE */
  description?: string;

  /** Icon identifier for UI display. @property {String} icon - Visual identifier for this location type @access READ, CREATE, UPDATE */
  icon?: string;

  /** Arbitrary metadata attached to this location type. @property {Object} metadata - Flexible metadata store @access READ, CREATE, UPDATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * Partnership model interface
 * Generated from backend schema
 */
export interface Partnership {
  /** Unique identifier for the company partnership record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this partnership record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** The external company this partnership is associated with. @property {UUID} companyId - Foreign key to company @access READ, CREATE, UPDATE @required for creation */
  companyId: string;

  /** The type of partnership relationship (e.g. supplier, stockist). @property {UUID} partnershipTypeId - Foreign key to partnershipType @access READ, CREATE, UPDATE @required for creation */
  partnershipTypeId: string;

  /** Name of the primary contact person for this partnership. @property {String} contactName - Relationship-specific contact name @access READ, CREATE, UPDATE */
  contactName?: string;

  /** Email address of the primary contact for this partnership. @property {String} contactEmail - Relationship-specific contact email @access READ, CREATE, UPDATE */
  contactEmail?: string;

  /** Phone number of the primary contact for this partnership. @property {String} contactPhone - Relationship-specific contact phone @access READ, CREATE, UPDATE */
  contactPhone?: string;

  /** 1-5 quality/performance score for this partnership, assigned by the account. @property {Number} rating - Partnership quality rating @access READ, CREATE, UPDATE */
  rating?: number;

  /** Date the partnership began. @property {Date} startedAt - Partnership start date @access READ, CREATE, UPDATE */
  startedAt?: Date;

  /** Date the partnership ended, if applicable. @property {Date} endedAt - Partnership end date @access READ, CREATE, UPDATE */
  endedAt?: Date;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * PartnershipType model interface
 * Generated from backend schema
 */
export interface PartnershipType {
  /** Unique identifier for the partnership type record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The profile that owns this partnership type. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to profile @access READ, CREATE @required for creation */
  ownerId: string;

  /** Descriptive label for the partnership type (e.g. Supplier, Stockist). Must be unique across partnership types. @property {String} label - Partnership type classification @access READ, CREATE, UPDATE @required for creation */
  label: string;

  /** Extended description of this partnership type. @property {String} description - Human-readable partnership type description @access READ, CREATE, UPDATE */
  description?: string;

  /** Icon identifier for UI display. @property {String} icon - Visual identifier for this partnership type @access READ, CREATE, UPDATE */
  icon?: string;

  /** Arbitrary metadata attached to this partnership type. @property {Object} metadata - Flexible metadata store @access READ, CREATE, UPDATE */
  metadata?: Record<string, unknown>;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  stateGraphId?: string;

  currentStateGraphStateId?: string;

  previousStateGraphStateId?: string;

  enteredCurrentStateAt?: Date;
}

/**
 * Assignee model interface
 * Generated from backend schema
 */
export interface Assignee {
  /** Unique identifier for the assignee record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this assignee record. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** The model name of the entity this assignment is attached to (e.g. 'company'). @property {String} entityType - Polymorphic entity type @access READ, CREATE @required for creation */
  entityType: string;

  /** The UUID of the target record this assignment is attached to. No FK constraint — polymorphic reference. @property {UUID} entityId - Polymorphic entity ID @access READ, CREATE @required for creation */
  entityId: string;

  /** The profile being assigned to the entity. @property {UUID} profileId - Foreign key to profile @access READ, CREATE @required for creation */
  profileId: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Attachment model interface
 * Generated from backend schema
 */
export interface Attachment {
  /** Unique identifier for the attachment record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this attachment. Determines permission scope for the record. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** The ID of the entity this attachment belongs to. Used alongside entityType for polymorphic reverse lookup. @property {UUID} entityId - Polymorphic entity reference ID @access READ, CREATE @required for creation */
  entityId: string;

  /** The type of entity this attachment belongs to. e.g. 'supplier_order', 'inventoryItem', 'batch' Used alongside entityId for polymorphic reverse lookup. @property {String} entityType - Polymorphic entity type discriminator @access READ, CREATE @required for creation */
  entityType: string;

  /** Original file name as provided by the uploading client. @property {String} fileName - Display name for the file @access READ, CREATE @required for creation */
  fileName: string;

  /** MIME type of the file (e.g. 'image/jpeg', 'application/pdf'). @property {String} mimeType - IANA media type identifier @access READ, CREATE */
  mimeType?: string;

  /** File size in bytes. @property {Integer} fileSizeBytes - Raw byte count of the uploaded file @access READ, CREATE */
  fileSizeBytes?: number;

  /** Reference key in the file storage backend (e.g. S3 object key). Treat as opaque — storage routing is handled by the application layer. @property {String} storageKey - Backend storage reference identifier @access READ, CREATE @required for creation */
  storageKey: string;

  /** The profile that uploaded this file. @property {UUID} uploadedBy - Foreign key to profile @access READ, CREATE @required for creation */
  uploadedBy: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}

/**
 * Comment model interface
 * Generated from backend schema
 */
export interface Comment {
  /** Unique identifier for the comment record. @property {UUID} id - Primary key using UUID v4 @access READ only */
  id?: string;

  /** The account that owns this comment. Determines permission scope. Set on create, never updated. @property {UUID} ownerId - Foreign key to account @access READ, CREATE @required for creation */
  ownerId: string;

  /** The profile of the user who wrote this comment. @property {UUID} authorId - Foreign key to profile @access READ, CREATE @required for creation */
  authorId: string;

  /** The model name of the entity this comment is attached to (e.g. 'company'). @property {String} entityType - Polymorphic entity type @access READ, CREATE @required for creation */
  entityType: string;

  /** The UUID of the target record this comment is attached to. No FK constraint — polymorphic reference. @property {UUID} entityId - Polymorphic entity ID @access READ, CREATE @required for creation */
  entityId: string;

  /** The text content of the comment. @property {String} body - Comment body text @access READ, CREATE, UPDATE @required for creation */
  body: string;

  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;
}