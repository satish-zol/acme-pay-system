module Api
  module V1
    class AnalyticsController < ApplicationController
      def show
        render json: {
          headcount: Employee.count,
          compensation_by_currency: salary_groups(:currency),
          compensation_by_country: salary_groups(:country, :currency),
          compensation_by_department: salary_groups(:department, :currency)
        }
      end

      private

      def salary_groups(*group_columns)
        Employee.group(*group_columns).pluck(
          *group_columns,
          Arel.sql("COUNT(*)"),
          Arel.sql("AVG(annual_salary)"),
          Arel.sql("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_salary)"),
          Arel.sql("MIN(annual_salary)"),
          Arel.sql("MAX(annual_salary)")
        ).map do |values|
          keys = group_columns.map(&:to_sym)
          group_values = values.first(group_columns.length)
          keys.zip(group_values).to_h.merge(
            headcount: values[-5],
            average_salary: values[-4].to_d.round(2),
            median_salary: values[-3].to_d.round(2),
            minimum_salary: values[-2].to_d,
            maximum_salary: values[-1].to_d
          )
        end
      end
    end
  end
end
