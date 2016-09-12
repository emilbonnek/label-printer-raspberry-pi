require 'sinatra'
require 'json'
require 'csv'

require 'prawn'
require 'barby/outputter/prawn_outputter'

require_relative 'barcode.rb'
require_relative 'label_machine.rb'

label_machine = LabelMachine.new

set :port, 80

get '/alive' do
  status 200
  body "jeg er her"
end

get '/print' do
  status 405
  body "Brug POST istedet"
end

post '/new_datafile' do
  unless params[:file] &&
         (tmpfile = params[:file][:tempfile]) &&
         (name = params[:file][:filename])
    "Fejl!"
  end
  STDERR.puts "Uploading file, original name #{name.inspect}"

  File.open('varer.csv', 'wb') {|f| f.write tmpfile.read }

  body "Filen blev uploadet"
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
  barcode = Barcode.make(params[:barcode_number], barcode_type)
  label_settings = {item_number: params[:item_number], description:params[:description], variant:params[:variant] ,barcode: barcode}
  
  File.open('log.txt', 'a') do |f|
    t = Time.now.strftime("%Y-%m-%d %H:%M")
    f.puts(t+";PRINT;#{params[:item_number]};#{params[:variant]};#{params[:amount]};#{params[:description]};#{barcode.to_s}")
  end
end

# --
# ALLE kollonner i datafilen skal være i listen herunder i korrekt rækkefølge.
headers  = [:bar_num, :barcode_description, :item_num, :variant, :price, :description, :x2, :x3, :x4, :x5, :x6, :x7]
# De kollonner der skal bruges skal OGSÅ fremgå i listen herunder.
relevant = [:bar_num, :item_num, :variant, :price, :description]
Csv = CSV.read('varer.csv', write_headers: true, headers:headers, encoding: "CP850", col_sep: ';', quote_char: "@")

# Fjern kolonner der ikke er i brug
(headers - relevant).each do |irelevant|
  Csv.delete(irelevant)
end

get '/' do
  @barcode_types = Barcode::TYPES.keys
  erb :index
end
post '/products' do
  content_type :json
  products = Csv.find_all {|row| row[:bar_num].start_with?("29")}
  products.map! {|product| product.to_hash}
  products.each do |product|
    product[:description].chomp! " - #{product[:variant]}"
    product[:description].chomp! product[:variant]
    product[:description] = product[:description].split.join(" ")
  end
  return products.to_json
end

post '/search' do
  item_number = params['item_number']
  content_type :json
  search_textfile(item_number).to_json
end