package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"dockemon/core/bindings"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	dockerCommandBindings := &bindings.DockerCommandBindings{}
	hostBindings := &bindings.HostBindings{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "dockemon",
		Width:  1280,
		Height: 832,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		Frameless:        true,
		OnStartup:        app.startup,
		Windows: &windows.Options{
			WebviewIsTransparent:              true,
			WindowIsTranslucent:               true,
			BackdropType:                      windows.Acrylic,
			DisableFramelessWindowDecorations: false,
		},
		Bind: []interface{}{
			app,
			dockerCommandBindings,
			hostBindings,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
