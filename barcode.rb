require 'barby'
require 'barby/barcode/code_25'
require 'barby/barcode/code_25_interleaved'
require 'barby/barcode/code_25_iata'
require 'barby/barcode/code_39'
require 'barby/barcode/code_93'
require 'barby/barcode/code_128'
require 'barby/barcode/gs1_128'
require 'barby/barcode/ean_13'
require 'barby/barcode/bookland'
require 'barby/barcode/ean_8'
require 'barby/barcode/upc_supplemental'

module Barcode
  TYPES = {
    "code_128b" => Barby::Code128B,
    "bookland" => Barby::Bookland,
    "code_39" => Barby::Code39,
    "code_25" => Barby::Code25,
    "code_25_interleaved" => Barby::Code25Interleaved,
    "code_25_iata" => Barby::Code25IATA,
    "code_93" => Barby::Code93,
    "code_128" => Barby::Code128,
    "code_128a" => Barby::Code128A,
    "code_128c" => Barby::Code128C,
    "gs1_128" => Barby::GS1128,
    "ean_8" => Barby::EAN8,
    "ean_13" => Barby::EAN13,
    "upc_supplemental" => Barby::UPCSupplemental
  }
  DEFAULT_TYPE = TYPES["code_128b"]
  def self.make(type, string)
    (TYPES[type] || DEFAULT_TYPE).new(string)
  end
end