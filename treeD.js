module.exports = class PointsArray{
    constructor(points, inputDim,outputDim){
        this.constructorValidation(points, inputDim,outputDim);
        this.points=points;
        this.dim=inputDim+outputDim;
        this.inputDim=inputDim;
        this.outputDim=outputDim;
        this.count = points.length/this.dim
    }
    constructorValidation(points, inputDim,outputDim){
        if(typeof inputDim!=='number'||inputDim<1){
            throw new Error('typeof inputDim!=="number"||inputDim<1')
        }
        if(typeof outputDim!=='number'||outputDim<1){
            throw new Error('typeof outputDim!=="number"||outputDim<1')
        }
        let dim = inputDim+outputDim
        if(points.length%dim!==0){
            throw new Error('points.length%dim!==0')
        }
        
        if(!(points instanceof Float32Array) ){
            throw new Error('!(points instanceof Float32Array)')
        }
    }
    center(){
        if(!this._center){

            let sum = new Float32Array(this.dim)
            for(let i=0;i!==this.count;i++){
                for(let j=0;j!==this.dim;j++){
                    sum[j]+=this.points[i*this.dim+j]
                }
            }
            for(let j=0;j!==this.dim;j++){
                sum[j]/=this.count
            }
            this._center=sum
        }
        return this._center;
    }
    outputCenter(){
        if(this._outputCenter){
            return this._outputCenter
        }
        let sum = new Float32Array(this.outputDim)
        for(let i=0;i!==this.count;i++){
            for(let j=0;j!==this.outputDim;j++){
                sum[j]+=this.points[i*this.dim+j+this.inputDim]
            }
        }
        for(let j=0;j!==this.outputDim;j++){
            sum[j]/=this.count
        }
        //console.log(sum);
        this._outputCenter= sum
        return sum;
    }
    angle(){
        if(this._angle){
            return this._angle
        }
        let center = this.center()
        let distances = new Float32Array(this.dim)
        let offsets = new Float32Array(this.dim)
        for(let i=0;i!==this.count;i++){

            for(let j=0;j<this.dim;j++){
                distances[j]+=Math.pow(center[j]-this.points[i*this.dim+j],2)
            }
        }
        let maxDim=0;
        let maxDist =0;
        for(let j=0;j<this.dim;j++){
            if(distances[j]>maxDist){
                maxDist=distances[j];
                maxDim=j;
            }
        }
        for(let i=0;i!==this.count;i++){
            if(this.points[i*this.dim+maxDim]>center[maxDim]){
                for(let j=0;j<this.dim;j++){
                    offsets[j]+=this.points[i*this.dim+j]-center[j]
                }
            }
        }
        for(let i=0;i<this.dim;i++){
            if(offsets[i]<0){
                distances[i]=-distances[i]
            }
            distances[i]=distances[i]/maxDist;
        }
        this._angle=distances
        return distances;
    }
    divineByAngle(){
        let angle = this.angle()
        let center = this.center();
        let leftCount = 0
        let rightCount = 0
        let results = new Uint8Array(this.count)
        for(let i=0;i!==this.count;i++){
            let sum =0;
            for(let j=0;j<this.dim;j++){
                sum+=(this.points[i*this.dim+j]-center[j])*angle[j]
            }
            if(sum>0){
                results[i]=1
                rightCount++
            }else{
                results[i]=0;
                leftCount++
            }
        }
        let left = new Float32Array(leftCount*this.dim)
        let right = new Float32Array(rightCount*this.dim)
        let leftOffset = 0;
        let rightOffset = 0;
        for(let i=0;i!==this.count;i++){
            if(results[i]){
                for(let j=0;j<this.dim;j++){
                    right[rightOffset*this.dim+j]=this.points[i*this.dim+j];
                }
                rightOffset++
            }else{
                for(let j=0;j<this.dim;j++){
                    left[leftOffset*this.dim+j]=this.points[i*this.dim+j];
                }
                leftOffset++
            }
        }
        for(let i =0;i!==left.length;i++){
            this.points[i]=left[i]
        }
        for(let i =0;i!==right.length;i++){
            this.points[i+left.length]=right[i]
        }
        
        return [new PointsArray(this.points.subarray(0,left.length),this.inputDim, this.outputDim),new PointsArray(this.points.subarray(left.length, left.length+right.length),this.inputDim, this.outputDim)]
    }
}
// class Tree {
//     constructor(points, inputDim,outputDim){

//     }
// }