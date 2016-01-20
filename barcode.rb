require 'barby'
require 'barby/barcode/code_39'
require 'barby/barcode/code_128'

module Barcode
  def self.get(number, type)
    case type
    when "code_39"
      Barby::Code39.new(number)
    when "code_128"
      Barby::Code128B.new(number)
    end
  end
end