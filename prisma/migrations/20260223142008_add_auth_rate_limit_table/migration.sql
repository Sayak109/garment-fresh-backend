-- CreateTable
CREATE TABLE "tbl_auth_rate_limit" (
    "id" BIGSERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "penalty_level" INTEGER NOT NULL DEFAULT 0,
    "block_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_auth_rate_limit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tbl_auth_rate_limit_identifier_ip_address_idx" ON "tbl_auth_rate_limit"("identifier", "ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_rate_limit_identifier_ip_address_key" ON "tbl_auth_rate_limit"("identifier", "ip_address");
