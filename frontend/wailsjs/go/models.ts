export namespace models {
	
	export class DockerContainerData {
	    ID: string;
	    RepoTag: string;
	    RepoTitle: string;
	    Comment: string;
	    // Go type: time
	    Created: any;
	    Size: number;
	    ComposeProjectTitle: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerContainerData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.RepoTag = source["RepoTag"];
	        this.RepoTitle = source["RepoTitle"];
	        this.Comment = source["Comment"];
	        this.Created = this.convertValues(source["Created"], null);
	        this.Size = source["Size"];
	        this.ComposeProjectTitle = source["ComposeProjectTitle"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DockerImage {
	    Image: string;
	    ID: string;
	    DiskUsage: string;
	    ContentSize: string;
	    Extra: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Image = source["Image"];
	        this.ID = source["ID"];
	        this.DiskUsage = source["DiskUsage"];
	        this.ContentSize = source["ContentSize"];
	        this.Extra = source["Extra"];
	    }
	}

}

