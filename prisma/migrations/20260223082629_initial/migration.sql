-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('GOOGLE', 'APPLE', 'EMAIL_OTP', 'PHONE_OTP', 'EMAIL_PW');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('OWNER', 'ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'UPGRADED', 'CANCELLED', 'EXPIRED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "SubscriptionSource" AS ENUM ('RAZORPAY', 'ADMIN');

-- CreateEnum
CREATE TYPE "RazorpayEntityType" AS ENUM ('SUBSCRIPTION', 'PAYMENT', 'INVOICE');

-- CreateEnum
CREATE TYPE "SubscriptionCycle" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "tbl_user_session" (
    "id" BIGSERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "org_id" BIGINT,
    "device_info" JSONB,
    "ip_address" TEXT,
    "refresh_token_hash" TEXT NOT NULL,
    "refresh_token_encrypted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tbl_user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_role" (
    "id" BIGSERIAL NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_admin_settings" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_user" (
    "id" BIGSERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role_id" BIGINT NOT NULL,
    "phone_no" TEXT,
    "image" TEXT,
    "dob" TIMESTAMP(3),
    "auth_method" "AuthType" NOT NULL,
    "provider_id" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "refresh_token" TEXT,
    "reset_token" TEXT,
    "reset_token_exp" TIMESTAMP(3),
    "is_temporary" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_otp" (
    "id" TEXT NOT NULL,
    "credential" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 0,
    "is_email" BOOLEAN NOT NULL DEFAULT true,
    "restrictedTime" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_invalidated_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "tbl_invalidated_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_user_fcm_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_fcm_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_session_session_id_key" ON "tbl_user_session"("session_id");

-- CreateIndex
CREATE INDEX "tbl_user_session_session_id_user_id_org_id_ip_address_revok_idx" ON "tbl_user_session"("session_id", "user_id", "org_id", "ip_address", "revoked");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_role_name_key" ON "tbl_role"("name");

-- CreateIndex
CREATE INDEX "tbl_role_name_idx" ON "tbl_role"("name");

-- CreateIndex
CREATE INDEX "tbl_admin_settings_title_idx" ON "tbl_admin_settings"("title");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_email_key" ON "tbl_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_provider_id_key" ON "tbl_user"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_reset_token_key" ON "tbl_user"("reset_token");

-- CreateIndex
CREATE INDEX "tbl_user_first_name_last_name_email_phone_no_auth_method_idx" ON "tbl_user"("first_name", "last_name", "email", "phone_no", "auth_method");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_otp_credential_key" ON "tbl_otp"("credential");

-- CreateIndex
CREATE INDEX "tbl_otp_credential_idx" ON "tbl_otp"("credential");

-- CreateIndex
CREATE INDEX "tbl_invalidated_tokens_user_id_idx" ON "tbl_invalidated_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "tbl_user_session" ADD CONSTRAINT "tbl_user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user" ADD CONSTRAINT "tbl_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tbl_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_invalidated_tokens" ADD CONSTRAINT "tbl_invalidated_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_fcm_tokens" ADD CONSTRAINT "tbl_user_fcm_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
