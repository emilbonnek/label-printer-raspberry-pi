require 'sinatra'
require 'json'
require 'csv'

require 'prawn'

require 'barby'
require 'barby/barcode/code_39'
require 'barby/outputter/prawn_outputter'

csv_text = File.read('varer.csv', encoding: "CP850")
# csv_text = File.read('tekstfil.txt', encoding: "CP850")
Csv = CSV.parse(csv_text, write_headers: true, headers:[:bar_num, :description, :item_num, :variant, :price], encoding: "CP850", col_sep: ';', :quote_char => "|")

def search_textfile(item_number)
  # csv_text = File.read('tekstfil.txt', encoding: "CP850")
  # csv = CSV.parse(csv_text, write_headers: true, headers:[:bar_num, :description, :item_num, :variant, :price], encoding: "CP850", col_sep: ';', :quote_char => "|")
  products = Csv.find_all {|row| row[:item_num].include?(item_number) and row[:bar_num].start_with?("29")}
  products.map! {|product| product.to_hash}
  products.each do |product|
    product[:description].chomp! " - #{product[:variant]}"
    product[:description].chomp! product[:variant]
    product[:description] = product[:description].split.join(" ")
  end
  # products.uniq! {|product| product[:bar_num] }
  return products#.take(3*3)
end

def print(params)
  label_width = 136.062992126
  label_height = 70.8661417323
  label = Prawn::Document.new({page_size: [label_width, label_height], margin: 0})
  
  # label.start_new_page

  barcode = Barby::Code39.new(params["barcode_number"])
  
  outputter = Barby::PrawnOutputter.new(barcode)
  outputter.height = 15
  outputter.xdim = 0.7

  # until ((outputter.full_width+5)-label_width).abs <= 0.02 do
  #   outputter.xdim += 0.01 if (outputter.full_width+5)<label_width
  #   outputter.xdim -= 0.01 if (outputter.full_width+5)>label_width
  # end

  outputter.x = (label_width-outputter.full_width)/2
  outputter.y = (label_height-outputter.full_height)/4
  outputter.annotate_pdf(label)

  label.text_box(params['description'], {at: [5,label_height-25], size: 7, width: label_width-10, align: :center})
  label.text_box(params['item_number'], {at: [5,label_height-10], size: 7})
  label.text_box(params['variant'].reverse, {at: [label_width/2, label_height-10],size: 7, direction: :rtl}) unless params['variant'].nil?

  box_width = outputter.full_width
  box_height = outputter.y-outputter.height/2
  label.text_box(params['barcode_number'], {at: [(label_width-box_width)/2,outputter.y-5], 
                                size: 7, 
                                width: box_width,
                                height: box_height,
                                character_spacing: 4,
                                align: :center
                                })

  label.render_file "labels/#{params['item_number']}.pdf"
  system("lpr", "labels/#{params['item_number']}.pdf","-##{params['antal']}") or raise "kunne ikke printe"
end


get '/' do
  erb :index
end
post '/search' do
  item_number = params['item_number']
  content_type :json
  search_textfile(item_number).to_json
end
post '/print' do
  puts params
  important_params = [:item_number, :description, :variant, :barcode_number, :antal]
  missing_params = []
  if important_params.all? {|imp_param| params.has_key? imp_param} 
    File.open('log.txt', 'a') do |f|
      t = Time.now.strftime("%Y-%m-%d %H:%M")
      f.puts(t+";PRINT;#{params['item_number']};#{params['variant']};#{params['antal']};#{params['description']};#{params['barcode_number']}")
    end
    print(params)
  else
    important_params.each do |imp_param|
      #puts "#{imp_param} - #{params.has_key?(imp_param.to_s)}"
      missing_params.push(imp_param) unless params.has_key? imp_param.to_s
    end
    #puts missing_params
    status 422
    body "manglende parametre: #{missing_params}"
  end
end
get '/print' do
  status 405
  body "Brug POST istedet"
end
