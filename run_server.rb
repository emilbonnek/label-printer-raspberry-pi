require 'sinatra'
require 'json'
require 'csv'

require 'prawn'
require 'barby/outputter/prawn_outputter'

require_relative 'barcode.rb'
require_relative 'label_machine.rb'

label_machine = LabelMachine.new

#set :port, 80

get '/alive' do
   body "jeg er her"
end

get '/print' do
  status 405
  body "Brug POST istedet"
end
post '/print' do

  barcode_type = params[:barcode_type]
  barcode = Barcode.make(barcode_type, params[:barcode_number])
  label_settings = {item_number: params[:item_number], description:params[:description], variant:params[:variant], barcode: barcode}
  label = label_machine.create(label_settings)


  label.render_file "labels/#{params[:item_number]}.pdf"
  system("lpr", "labels/#{params[:item_number]}.pdf","-##{params[:amount]}") or raise "kunne ikke printe"
  system("rm labels/#{params[:item_number]}.pdf")

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
  @barcode_types = Barcode::TYPES.keys
  erb :index
end
post '/search' do
  item_number = params['item_number']
  content_type :json
  search_textfile(item_number).to_json
end