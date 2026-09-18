package models

type Host struct {
	ID             string
	Name           string
	Address        string
	Port           int
	User           string
	PrivateKeyPath string
}
