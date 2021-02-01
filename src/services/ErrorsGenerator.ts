class ErrorsGenerator extends Error {
  title : string
  message : string
  status: number
  type : string
  instance : string
  test : any

  constructor(title,message,status,instance="none",type="none") {
    super(message);
    this.name = title
    this.title = title
    this.message = message
    this.status = status
    this.instance = instance
    this.type = type
  }
}


export default ErrorsGenerator
