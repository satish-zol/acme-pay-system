module Api
  module V1
    class ApplicationController < ActionController::API
      private

      def render_error(message, status:)
        render json: { error: message }, status: status
      end
    end
  end
end
