require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  test "requires a valid currency and nonnegative salary" do
    employee = Employee.new(
      employee_number: "AC99999",
      first_name: "Taylor",
      last_name: "Jordan",
      email: "taylor.jordan@example.test",
      job_title: "Analyst",
      department: "Finance",
      country: "Canada",
      currency: "CAD",
      annual_salary: 80_000
    )

    assert_predicate employee, :valid?
    employee.currency = "ZZZ"
    assert_not employee.valid?
    assert_includes employee.errors[:currency], "is not included in the list"
    employee.currency = "CAD"
    employee.annual_salary = -1
    assert_not employee.valid?
    assert_includes employee.errors[:annual_salary], "must be greater than or equal to 0"
  end
end
