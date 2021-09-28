
var classifier = {
    signature: '',
    height: 640,
    width: 480,
    outputName: '',
    inputKey: "Image",
    labelKey: "Label",
    labels: [],
    version: 0,
    model: tf.GraphModel,

    async load (signaturePath, modelPath) {
        /* Load our TensorFlow.js GraphModel */
        const signatureFile = await fetch(signaturePath)
        this.signature = await signatureFile.json()
        let dims = this.signature.inputs[this.inputKey].shape.slice(1,3)
        this.width = dims[0]
        this.height = dims[1]
        this.outputName = this.signature.outputs['Confidences'].name
        this.labels = this.signature.classes[this.labelKey]
        this.model = await tf.loadGraphModel(modelPath)
    },

    dispose () {
        /* Free up the memory used by the TensorFlow.js GraphModel */
        if (this.model) {
            this.model.dispose()
            this.model = undefined
        }
    },

    async predict(imageData) {
        /*
        Given an input image data from a Canvas,
        preprocess the image into a tensor with pixel values of [0,1], center crop to a square
        and resize to the image input size, then run the prediction!
         */
        if (this.model) {
            // use tf tidy to dispose of intermediate tensors automatically
            const confidencesTensor = tf.tidy(() => {
                // create a tensor from the canvas image data
                const image = tf.browser.fromPixels(imageData)
                const [imgHeight, imgWidth] = image.shape.slice(0,2)
                // convert image to 0-1
                const normalizedImage = tf.div(image, tf.scalar(255))
                // make into a batch of 1 so it is shaped [1, height, width, 3]
                const batchImage = tf.expandDims(normalizedImage)
                // center crop and resize
                /*
                Instead of center cropping, you can use any number of methods for making the image square and the right shape.
                You can resize (squeeze or expand height/width to fit), pad with 0's so that the whole image is square and has black bars,
                or pad with different pixel values like mirroring. We recommend using the same resize function here that was used during
                training or the creation of your dataset. Lobe by default with center crop to the square.
                 */
                let top = 0
                let left = 0
                let bottom = 1
                let right = 1
                if (imgHeight !== imgWidth) {
                    // the crops are normalized 0-1 percentage of the image dimension
                    const size = Math.min(imgHeight, imgWidth)
                    left = (imgWidth - size) / 2 / imgWidth
                    top = (imgHeight - size) / 2 / imgHeight
                    right = (imgWidth + size) / 2 / imgWidth
                    bottom = (imgHeight + size) / 2 / imgHeight
                }
                // center crop our image and resize it to the size found in signature.json
                const croppedImage = tf.image.cropAndResize(
                    batchImage, [[top, left, bottom, right]], [0], [this.height, this.width]
                )
                // run the model on our image and await the results as an array
                if (this.model) {
                    return this.model.execute(
                        {[this.signature.inputs[this.inputKey].name]: croppedImage}, this.outputName
                    )
                }
            })
            if (confidencesTensor) {
                // grab the array of values from the tensor data
                const confidencesArray = await confidencesTensor.data()
                // now that we have the array values, we can dispose the tensor and free memory
                confidencesTensor.dispose()
                // return a map of [label]: confidence computed by the model
                // the list of labels maps in the same index order as the outputs from the results
                return this.labels.reduce(
                    (returnConfidences, label, idx) => {
                        return {[label]: confidencesArray[idx], ...returnConfidences}
                    }, {}
                )
            }
        } else {
            throw new Error('Model not loaded')
        }
    }
}
