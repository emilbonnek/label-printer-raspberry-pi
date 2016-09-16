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
headers  = [:bar_num, :barcode_description, :item_num, :variant, :price, :description, :x2, :l_num, :divison, :seson, :x6, :variant_code]
# De kollonner der skal bruges skal OGSÅ fremgå i listen herunder.
relevant = [:bar_num, :item_num, :variant, :price, :description, :l_num, :divison, :seson, :variant_code]
Csv = CSV.read('varer.csv', write_headers: true, headers:headers, encoding: "CP850", col_sep: ';', quote_char: "@")

# Fjern kolonner der ikke er i brug
(headers - relevant).each do |irelevant|
  Csv.delete(irelevant)
end

products = Csv.map { |product| product.to_hash }

# Grupper linjer efter varenummer dvs. at alle varianter til en vare nu ligger under varenummeret de tilhører
products = products.group_by{|product| product[:item_num] }

new_products = products.map do |item_num, variants|
  # Hvis der findes en vare der både kommer med variant og ikke variant, så slet dem uden variant. eks. 501648
  if variants.length > 1 and variants.any? {|variant| variant[:variant]!=nil }
    variants.delete_if {|variant| variant[:variant]==nil}
  end
  # Skriv oprettelsesdatoer i alle produkter ordentligt
  variants.each do |variant|
    variant[:x6] = (variant[:x6] ? Date.strptime(variant[:x6], "%d-%m-%y") : Date.new)
  end
  # Sorter efter stregkode (med 29 først som prioritet) og oprettelsesdato
  variants.sort_by!{|variant| [variant[:bar_num][0..1].to_i-29, variant[:x6]]}
  # Hvis der en variant fremgår flere gange så vælg den første og drop de andre (hint. varianterne blev sorteret ovenfor)
  variants.uniq! {|v| v[:variant]}
  # Opret en enkelet ny "linje" med informationer om alle varianter af dette produkt
  new_product = Hash.new
  new_product[:item_num] = item_num
  new_product[:description] = variants[0][:description]
  new_product[:bar_num] = variants.map{|variant| variant[:bar_num]}
  new_product[:variant] = variants.map{|variant| variant[:variant]}
  new_product[:price] = variants[0][:price]
  new_product
end

File.open('public/varer.json', 'wb') {|f| f.write new_products.to_json }

get '/' do
  @barcode_types = Barcode::TYPES.keys
  erb :index
end
post '/products' do
  content_type :json
  redirect "/varer.json"
end