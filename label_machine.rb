require 'prawn'
require 'barby/outputter/prawn_outputter'

class LabelMachine
  attr_reader :label_width, :label_height
  def initialize
    @label_width = 136.062992126
    @label_height = 70.8661417323
  end
  def create(options = {})
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
    return label
  end
end