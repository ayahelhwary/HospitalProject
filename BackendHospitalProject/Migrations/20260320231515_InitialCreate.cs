using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendHospitalProject.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "app_users",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    password_hash = table.Column<string>(type: "TEXT", nullable: false),
                    role = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "patient"),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "doctor_profiles",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    app_user_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    full_name = table.Column<string>(type: "TEXT", nullable: false),
                    specialty = table.Column<string>(type: "TEXT", nullable: false),
                    department = table.Column<string>(type: "TEXT", nullable: true),
                    phone = table.Column<string>(type: "TEXT", nullable: true),
                    bio = table.Column<string>(type: "TEXT", nullable: true),
                    avatar_url = table.Column<string>(type: "TEXT", nullable: true),
                    license_number = table.Column<string>(type: "TEXT", nullable: true),
                    years_experience = table.Column<int>(type: "INTEGER", nullable: false),
                    consultation_fee = table.Column<decimal>(type: "REAL", nullable: false),
                    available = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_doctor_profiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_doctor_profiles_app_users_app_user_id",
                        column: x => x.app_user_id,
                        principalSchema: "public",
                        principalTable: "app_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_profiles",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    app_user_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    user_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    full_name = table.Column<string>(type: "TEXT", nullable: false),
                    date_of_birth = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    phone = table.Column<string>(type: "TEXT", nullable: true),
                    blood_type = table.Column<string>(type: "TEXT", nullable: true),
                    address = table.Column<string>(type: "TEXT", nullable: true),
                    emergency_contact = table.Column<string>(type: "TEXT", nullable: true),
                    emergency_phone = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_profiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_profiles_app_users_app_user_id",
                        column: x => x.app_user_id,
                        principalSchema: "public",
                        principalTable: "app_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "appointments",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    patient_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    doctor_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    patient_name = table.Column<string>(type: "TEXT", nullable: false),
                    patient_email = table.Column<string>(type: "TEXT", nullable: true),
                    patient_phone = table.Column<string>(type: "TEXT", nullable: true),
                    appointment_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    appointment_time = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "pending"),
                    reason = table.Column<string>(type: "TEXT", nullable: true),
                    notes = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointments", x => x.id);
                    table.CheckConstraint("CK_appointments_status", "status IN ('pending','confirmed','completed','cancelled')");
                    table.ForeignKey(
                        name: "FK_appointments_doctor_profiles_doctor_id",
                        column: x => x.doctor_id,
                        principalSchema: "public",
                        principalTable: "doctor_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointments_patient_profiles_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "public",
                        principalTable: "patient_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "medical_records",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    patient_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    doctor_id = table.Column<Guid>(type: "TEXT", nullable: true),
                    visit_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    doctor_name = table.Column<string>(type: "TEXT", nullable: true),
                    department = table.Column<string>(type: "TEXT", nullable: true),
                    diagnosis = table.Column<string>(type: "TEXT", nullable: true),
                    medications = table.Column<string>(type: "TEXT", nullable: true),
                    lab_results = table.Column<string>(type: "TEXT", nullable: true),
                    radiology = table.Column<string>(type: "TEXT", nullable: true),
                    surgeries = table.Column<string>(type: "TEXT", nullable: true),
                    allergies = table.Column<string>(type: "TEXT", nullable: true),
                    notes = table.Column<string>(type: "TEXT", nullable: true),
                    created_by = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "patient"),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medical_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_medical_records_doctor_profiles_doctor_id",
                        column: x => x.doctor_id,
                        principalSchema: "public",
                        principalTable: "doctor_profiles",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_medical_records_patient_profiles_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "public",
                        principalTable: "patient_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patient_qr_codes",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "TEXT", nullable: false),
                    patient_id = table.Column<Guid>(type: "TEXT", nullable: false),
                    token = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_qr_codes", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_qr_codes_patient_profiles_patient_id",
                        column: x => x.patient_id,
                        principalSchema: "public",
                        principalTable: "patient_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_app_users_email",
                schema: "public",
                table: "app_users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_appointments_doctor_id",
                schema: "public",
                table: "appointments",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_patient_id",
                schema: "public",
                table: "appointments",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_doctor_profiles_app_user_id",
                schema: "public",
                table: "doctor_profiles",
                column: "app_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_medical_records_doctor_id",
                schema: "public",
                table: "medical_records",
                column: "doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_medical_records_patient_id",
                schema: "public",
                table: "medical_records",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_profiles_app_user_id",
                schema: "public",
                table: "patient_profiles",
                column: "app_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_patient_qr_codes_patient_id",
                schema: "public",
                table: "patient_qr_codes",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_qr_codes_token",
                schema: "public",
                table: "patient_qr_codes",
                column: "token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "appointments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "medical_records",
                schema: "public");

            migrationBuilder.DropTable(
                name: "patient_qr_codes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "doctor_profiles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "patient_profiles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "app_users",
                schema: "public");
        }
    }
}
