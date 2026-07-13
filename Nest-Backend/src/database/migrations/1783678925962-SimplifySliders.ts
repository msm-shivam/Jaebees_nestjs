import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifySliders1783678925962 implements MigrationInterface {
    name = 'SimplifySliders1783678925962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_85caad109bcb39340b43142df5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b03f269dd4fa700ae7c53302e1"`);
        await queryRunner.query(`ALTER TABLE "sliders" DROP COLUMN "sort_order"`);
        await queryRunner.query(`ALTER TABLE "sliders" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "sliders" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "sliders" DROP COLUMN "subtitle"`);
        await queryRunner.query(`ALTER TABLE "sliders" DROP COLUMN "link"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sliders" ADD "link" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "sliders" ADD "subtitle" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "sliders" ADD "title" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sliders" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sliders" ADD "sort_order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX "IDX_b03f269dd4fa700ae7c53302e1" ON "sliders" USING btree ("sort_order") `);
        await queryRunner.query(`CREATE INDEX "IDX_85caad109bcb39340b43142df5" ON "sliders" USING btree ("is_active") `);
    }

}
