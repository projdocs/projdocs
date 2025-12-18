package middleware

import "net/http"

func isJSON(ct string) bool {
	// Accept: application/json
	// Accept: application/json; charset=utf-8
	return ct == "application/json" ||
		(len(ct) > len("application/json") &&
			ct[:len("application/json")] == "application/json")
}

func JSONContentType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost, http.MethodPut, http.MethodPatch:
			ct := r.Header.Get("Content-Type")
			if ct == "" || !isJSON(ct) {
				http.Error(
					w,
					"content-type must be application/json",
					http.StatusUnsupportedMediaType,
				)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
