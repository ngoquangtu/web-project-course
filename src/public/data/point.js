class myPoint
{
    constructor( point)
    {
        this.point=point;
    }
     addPoint()
    {
        this.point++;
    }
     setPoint(point )
    {
        this.point=point;
    }
    getPoint()
    {
        return this.point;
    }
     loadPoint()
    {
        console.log("Điểm hiện tại của tôi là ",this.point);
    }
}
export default myPoint;
