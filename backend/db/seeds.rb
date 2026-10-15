require "digest"

departments = {
  "Engineering" => ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "QA Engineer"],
  "Product" => ["Product Manager", "Product Designer", "UX Researcher"],
  "Sales" => ["Account Executive", "Sales Manager", "Solutions Engineer"],
  "Marketing" => ["Marketing Manager", "Content Strategist", "Growth Analyst"],
  "People" => ["HR Business Partner", "Recruiter", "People Operations Specialist"],
  "Finance" => ["Financial Analyst", "Controller", "Payroll Specialist"],
  "Operations" => ["Operations Manager", "Business Analyst", "Program Manager"]
}.freeze
locations = [
  ["United States", "USD"], ["United Kingdom", "GBP"], ["Germany", "EUR"],
  ["France", "EUR"], ["Canada", "CAD"], ["Australia", "AUD"],
  ["India", "INR"], ["Japan", "JPY"], ["Singapore", "SGD"], ["Switzerland", "CHF"]
].freeze
first_names = %w[Alex Amara Asha Daniel Elena Fatima Hiro Isabella Jamal Jia Kai Liam Maya Noah Olivia Priya Sam Sofia Theo]
last_names = %w[Adams Brown Chen Davis Garcia Gupta Ivanov Jones Khan Kim Lee Martin Nguyen Patel Smith Taylor Wilson Yamamoto]

now = Time.current
records = 10_000.times.map do |index|
  employee_number = format("AC%05d", index + 1)
  hash = Digest::SHA256.hexdigest(employee_number)
  department = departments.keys[index % departments.length]
  country, currency = locations[(index * 7) % locations.length]
  salary = 45_000 + (hash[0, 8].to_i(16) % 105_001)

  {
    employee_number: employee_number,
    first_name: first_names[hash[8, 2].to_i(16) % first_names.length],
    last_name: last_names[hash[10, 2].to_i(16) % last_names.length],
    email: "employee#{index + 1}@acme.example",
    job_title: departments.fetch(department)[hash[12, 2].to_i(16) % departments.fetch(department).length],
    department: department,
    country: country,
    currency: currency,
    annual_salary: salary,
    created_at: now,
    updated_at: now
  }
end

Employee.upsert_all(records, unique_by: :employee_number)
puts "Seeded #{Employee.count} synthetic employees."
