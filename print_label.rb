require 'csv'

require 'prawn'

require 'barby'
require 'barby/barcode/code_128'
require 'barby/outputter/prawn_outputter'

class Label
  attr_reader :barcode_num, :description, :product_num, :variant, :price
  def initialize(values)
    @barcode_num = values[0]
    @description = values[1]
    @product_num = values[2]
    @variant = values[3]
    @price = values[4]

    print
  end
  def print
    label_width = 136.062992126
    label_height = 70.8661417323
    label = Prawn::Document.new({page_size: [label_width, label_height], margin: 0})

    barcode = Barby::Code128B.new(@barcode_num)

    outputter = Barby::PrawnOutputter.new(barcode)
    outputter.height = 15
    outputter.xdim = 0.7
    outputter.x = (label_width-outputter.full_width)/2
    outputter.y = (label_height-outputter.full_height)/4
    outputter.annotate_pdf(label)

    label.text_box(@description, {at: [5,label_height-10],size: 7})
    label.text_box("Vare-nr: #{@product_num}", {at: [5,label_height-20] ,size: 7})
    label.text_box(@variant, {at: [label_width-30, label_height-10],size: 7}) unless @variant.nil?

    box_width = outputter.full_width
    box_height = outputter.y-outputter.height/2
    label.text_box(@barcode_num, {at: [(label_width-box_width)/2,outputter.y-5], 
                            size: 7, 
                            width: box_width,
                            height: box_height,
                            character_spacing: 4,
                            align: :center
                            })

    label.render_file "#{@item_num}.pdf"
    system("lpr", "#{@item_num}.pdf") or raise "kunne ikke printe"
    system("rm #{@item_num}.pdf")
  end
end



item_number = ARGV[0]

csv_text = File.read('tekstfil.txt', encoding: "CP850")
csv = CSV.parse(csv_text, write_headers: true, headers:[:bar_num, :description, :item_num, :variant, :price], encoding: "CP850", col_sep: ';', :quote_char => "|")
products = csv.find_all {|row| row[:item_num]==item_number and row[:bar_num]!=item_number}

puts "Der blev fundet #{products.count} varer."

if products.count == 1
  product = products[0]
  Label.new(product)
elsif products.count > 1
  products.each do |product|
    Label.new(product)
  end
end