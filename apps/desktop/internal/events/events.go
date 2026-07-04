package Events

var ProjDocs = getProjDocsEvents()

type ProjDocsEvents struct {
	Window struct {
		SetVisible string
	}
}

func getProjDocsEvents() ProjDocsEvents {
	return ProjDocsEvents{
		Window: struct{ SetVisible string }{SetVisible: "projdocs:window:set-visible"},
	}
}
