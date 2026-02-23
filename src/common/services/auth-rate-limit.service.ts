import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthRateLimitService {
    private readonly MAX_ATTEMPTS = 5;
    private readonly PENALTY_STEPS = [60, 180, 300, 600];

    constructor(private readonly prisma: PrismaService) { }

    async handleAuthFailure(identifier?: string | null, ip?: string | null): Promise<void> {
        if (!identifier) {
            return;
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();
        const normalizedIp = this.normalizeIp(ip);

        const state = await this.prisma.authRateLimit.upsert({
            where: {
                identifier_ip_address: {
                    identifier: normalizedIdentifier,
                    ip_address: normalizedIp,
                },
            },
            create: {
                identifier: normalizedIdentifier,
                ip_address: normalizedIp,
                attempts: 1,
                penalty_level: 0,
            },
            update: {
                attempts: { increment: 1 },
            },
            select: {
                attempts: true,
                penalty_level: true,
            },
        });

        if (!state || state.attempts % this.MAX_ATTEMPTS !== 0) {
            return;
        }

        const nextPenaltyLevel = state.penalty_level + 1;
        const blockSeconds =
            this.PENALTY_STEPS[
            Math.min(nextPenaltyLevel - 1, this.PENALTY_STEPS.length - 1)
            ];

        await this.prisma.authRateLimit.update({
            where: {
                identifier_ip_address: {
                    identifier: normalizedIdentifier,
                    ip_address: normalizedIp,
                },
            },
            data: {
                penalty_level: nextPenaltyLevel,
                block_until: new Date(Date.now() + blockSeconds * 1000),
            },
        });
    }

    async resetAuthLimits(identifier?: string | null, ip?: string | null): Promise<void> {
        if (!identifier) {
            return;
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();
        const normalizedIp = this.normalizeIp(ip);

        await this.prisma.authRateLimit.deleteMany({
            where: {
                identifier: normalizedIdentifier,
                ip_address: normalizedIp,
            },
        });
    }

    async getActiveBlockTtl(identifier?: string | null, ip?: string | null): Promise<number> {
        if (!identifier) {
            return 0;
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();
        const normalizedIp = this.normalizeIp(ip);

        const state = await this.prisma.authRateLimit.findUnique({
            where: {
                identifier_ip_address: {
                    identifier: normalizedIdentifier,
                    ip_address: normalizedIp,
                },
            },
            select: {
                block_until: true,
            },
        });

        if (!state?.block_until) {
            return 0;
        }

        const ttlSeconds = Math.ceil((state.block_until.getTime() - Date.now()) / 1000);
        return ttlSeconds > 0 ? ttlSeconds : 0;
    }

    private normalizeIp(ip?: string | null): string {
        const normalized = (ip ?? '').trim();
        return normalized || 'unknown';
    }
}
