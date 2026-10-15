class Employee < ApplicationRecord
  CURRENCIES = %w[AUD CAD CHF EUR GBP INR JPY SGD USD].freeze

  validates :employee_number, :first_name, :last_name, :job_title, :department, :country, presence: true
  validates :employee_number, :email, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :currency, inclusion: { in: CURRENCIES }
  validates :annual_salary, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100_000_000 }

  scope :search, ->(term) {
    next all if term.blank?

    escaped = sanitize_sql_like(term.to_s.strip)
    where(
      "first_name ILIKE :term OR last_name ILIKE :term OR email ILIKE :term OR employee_number ILIKE :term",
      term: "%#{escaped}%"
    )
  }
end
