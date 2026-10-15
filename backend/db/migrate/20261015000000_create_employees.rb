class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_number, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.string :department, null: false
      t.string :country, null: false
      t.string :currency, limit: 3, null: false
      t.decimal :annual_salary, precision: 12, scale: 2, null: false
      t.timestamps
    end

    add_index :employees, :employee_number, unique: true
    add_index :employees, :email, unique: true
    add_index :employees, %i[country currency]
    add_index :employees, :department
    add_index :employees, :annual_salary
    add_check_constraint :employees, "annual_salary >= 0", name: "employees_salary_nonnegative"
    add_check_constraint :employees, "currency ~ '^[A-Z]{3}$'", name: "employees_currency_iso_code"
  end
end
