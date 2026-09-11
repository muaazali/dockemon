export namespace docker_commands {
	
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

