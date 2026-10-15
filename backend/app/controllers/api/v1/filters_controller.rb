module Api
  module V1
    class FiltersController < ApplicationController
      def index
        render json: {
          countries: Employee.distinct.order(:country).pluck(:country),
          departments: Employee.distinct.order(:department).pluck(:department)
        }
      end
    end
  end
end
