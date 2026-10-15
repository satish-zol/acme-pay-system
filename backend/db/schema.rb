# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_15_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "employees", force: :cascade do |t|
    t.string "employee_number", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "job_title", null: false
    t.string "department", null: false
    t.string "country", null: false
    t.string "currency", limit: 3, null: false
    t.decimal "annual_salary", precision: 12, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["annual_salary"], name: "index_employees_on_annual_salary"
    t.index ["country", "currency"], name: "index_employees_on_country_and_currency"
    t.index ["department"], name: "index_employees_on_department"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["employee_number"], name: "index_employees_on_employee_number", unique: true
    t.check_constraint "annual_salary >= 0::numeric", name: "employees_salary_nonnegative"
    t.check_constraint "currency::text ~ '^[A-Z]{3}$'::text", name: "employees_currency_iso_code"
  end
end
