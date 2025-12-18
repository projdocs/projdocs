package utils

func Pointer[T any](value T) *T {
	return &value
}

func Value[T any](value *T) T {
	return *value
}
