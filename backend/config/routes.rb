Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :employees, only: %i[index show update]
      get "analytics", to: "analytics#show"
      get "filters", to: "filters#index"
    end
  end
end
