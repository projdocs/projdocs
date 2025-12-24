package types

type DataResponse[T any] struct {
	Data  T    `json:"data"`
	Error *any `json:"error"` // always null
}

type ErrorResponse struct {
	Error string `json:"error"`
	Data  *any   `json:"data"` // always null
}

func NewDataResponse[T any](data T) *DataResponse[T] {
	return &DataResponse[T]{
		Data:  data,
		Error: nil,
	}
}

func NewErrorResponse(err error) *ErrorResponse {
	return &ErrorResponse{
		Error: err.Error(),
		Data:  nil,
	}
}
