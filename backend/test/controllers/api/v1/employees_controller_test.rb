require "test_helper"

module Api
  module V1
    class EmployeesControllerTest < ActionDispatch::IntegrationTest
      setup do
        Employee.delete_all
        @employee = Employee.create!(
          employee_number: "AC00001",
          first_name: "Morgan",
          last_name: "Lee",
          email: "morgan.lee@example.test",
          job_title: "Analyst",
          department: "Finance",
          country: "Canada",
          currency: "CAD",
          annual_salary: 80_000
        )
      end

      test "lists employees with server-side pagination metadata" do
        get "/api/v1/employees", as: :json

        assert_response :success, response.body
        assert_equal 1, response.parsed_body.dig("pagination", "total_count")
        assert_equal "AC00001", response.parsed_body.dig("employees", 0, "employee_number")
      end

      test "filters directory results by search term and country" do
        get "/api/v1/employees?q=Morgan&country=Canada", as: :json
        assert_response :success
        assert_equal 1, response.parsed_body.dig("pagination", "total_count")

        get "/api/v1/employees?q=missing&country=Canada", as: :json
        assert_response :success
        assert_empty response.parsed_body["employees"]
      end

      test "updates salary and rejects an unsupported currency" do
        patch "/api/v1/employees/#{@employee.id}",
          params: { employee: { annual_salary: 91_500, currency: "USD" } },
          as: :json

        assert_response :success
        assert_equal "91500.0", response.parsed_body["annual_salary"]

        patch "/api/v1/employees/#{@employee.id}",
          params: { employee: { currency: "ZZZ" } },
          as: :json
        assert_response :unprocessable_entity
        assert_equal "USD", @employee.reload.currency
      end

      test "returns not found for an unknown employee" do
        patch "/api/v1/employees/0", params: { employee: { annual_salary: 100 } }, as: :json
        assert_response :not_found
        assert_equal "Employee not found", response.parsed_body["error"]
      end

      test "reports salary ranges separately by currency, country, and department" do
        get "/api/v1/analytics", as: :json

        assert_response :success
        body = response.parsed_body
        assert_equal 1, body["headcount"]
        assert_equal "CAD", body.dig("compensation_by_currency", 0, "currency")
        assert_equal "Canada", body.dig("compensation_by_country", 0, "country")
        assert_equal "Finance", body.dig("compensation_by_department", 0, "department")
        assert_equal "80000.0", body.dig("compensation_by_currency", 0, "median_salary")
      end
    end
  end
end
