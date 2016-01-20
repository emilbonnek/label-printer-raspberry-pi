require 'sinatra'
require 'json'
require 'csv'

require 'prawn'
require 'barby/outputter/prawn_outputter'

require_relative 'barcode.rb'


def print(options = {})
    label_width = 136.062992126
    label_height = 70.8661417323
    label = Prawn::Document.new({page_size: [label_width, label_height], margin: 0})

    outputter = Barby::PrawnOutputter.new(options[:barcode])
    outputter.height = 15
    outputter.xdim = 0.7

    outputter.x = (label_width-outputter.full_width)/2
    outputter.y = (label_height-outputter.full_height)/4
    outputter.annotate_pdf(label)

    label.text_box(options[:description], {at: [5,label_height-25], size: 7, width: label_width-10, align: :center})
    label.text_box(options[:item_number], {at: [5,label_height-10], size: 7})
    label.text_box(options[:variant].reverse, {at: [label_width/2, label_height-10],size: 7, direction: :rtl}) unless options[:variant].nil?

    box_width = outputter.full_width
    box_height = outputter.y-outputter.height/2
    label.text_box(options[:barcode].to_s, {at: [(label_width-box_width)/2,outputter.y-5], 
                                  size: 7, 
                                  width: box_width,
                                  height: box_height,
                                  character_spacing: 4,
                                  align: :center
                                  })
    label.render_file "labels/#{options[:item_number]}.pdf"
  system("lpr", "labels/#{options[:item_number]}.pdf","-##{options[:amount]}") or raise "kunne ikke printe"
  system("rm labels/#{options[:item_number]}.pdf")
end

get '/print' do
  status 405
  body "Brug POST istedet"
end
post '/print' do
  barcode_type = params[:barcode_type] || "code_128"
  barcode = Barcode.get(params[:barcode_number], barcode_type)
  label_settings = {item_number: params[:item_number], description:params[:description], variant:params[:variant] ,barcode: barcode}

  print(label_settings)
  
  File.open('log.txt', 'a') do |f|
    t = Time.now.strftime("%Y-%m-%d %H:%M")
    f.puts(t+";PRINT;#{params[:item_number]};#{params[:variant]};#{params[:amount]};#{params[:description]};#{barcode.to_s}")
  end
end

# --

csv_text = File.read('varer.csv', encoding: "CP850")
Csv = CSV.parse(csv_text, write_headers: true, headers:[:bar_num, :description, :item_num, :variant, :price], encoding: "CP850", col_sep: ';', :quote_char => "|")

def search_textfile(item_number)
  products = Csv.find_all {|row| row[:item_num].include?(item_number) and row[:bar_num].start_with?("29")}
  products.map! {|product| product.to_hash}
  products.each do |product|
    product[:description].chomp! " - #{product[:variant]}"
    product[:description].chomp! product[:variant]
    product[:description] = product[:description].split.join(" ")
  end
  return products
end

get '/' do
  erb :index
end
post '/search' do
  item_number = params['item_number']
  content_type :json
  search_textfile(item_number).to_json
end