module Api
  module V1
    class EmployeesController < ApplicationController
      SORT_COLUMNS = {
        "name" => "last_name",
        "salary" => "annual_salary",
        "department" => "department",
        "country" => "country"
      }.freeze
      PAGE_SIZE = 25

      def index
        employees = Employee.all
          .search(params[:q])
          .yield_self { |relation| params[:country].present? ? relation.where(country: params[:country]) : relation }
          .yield_self { |relation| params[:department].present? ? relation.where(department: params[:department]) : relation }

        sort_column = SORT_COLUMNS.fetch(params[:sort].to_s, "last_name")
        direction = params[:direction] == "desc" ? :desc : :asc
        total_count = employees.count
        page = [params.fetch(:page, 1).to_i, 1].max

        render json: {
          employees: employees.order(sort_column => direction, id: :asc)
            .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
          pagination: {
            page: page,
            per_page: PAGE_SIZE,
            total_count: total_count,
            total_pages: (total_count.to_f / PAGE_SIZE).ceil
          }
        }
      end

      def show
        render json: Employee.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("Employee not found", status: :not_found)
      end

      def update
        employee = Employee.find(params[:id])
        unless employee.update(employee_params)
          return render json: { errors: employee.errors.to_hash }, status: :unprocessable_entity
        end

        render json: employee
      rescue ActiveRecord::RecordNotFound
        render_error("Employee not found", status: :not_found)
      end

      private

      def employee_params
        params.require(:employee).permit(:annual_salary, :currency)
      end
    end
  end
end
