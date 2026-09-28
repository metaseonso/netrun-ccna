/* real.js — real companies, standards bodies and products that appear in the game. Anything real in a braindance,
   a character or a scene gets a tag with its official mark in one colour (Simple Icons, CC0, kept in assets/brands), so the
   player learns who actually made the thing. `icon` is the Simple Icons slug; leave it out when the set has no mark and
   the tag shows the name in text. Marks belong to their owners (see terms.html). Add an entry the first time a night
   names something real, then set `real: ['id']` on the LORE beat, the gig, the shop item or the NPC. */
(function(){
  window.REAL = {
    cisco: { name: 'Cisco', owner: 'Cisco Systems, Inc.', icon: 'cisco', what: 'Makes the routers and switches the whole course runs on.' },
    xerox: { name: 'Xerox PARC', owner: 'Xerox Corporation', what: 'The lab where Ethernet was invented in 1973.' },
    kalpana: { name: 'Kalpana', owner: 'Cisco Systems, Inc. (acquired 1994)', what: 'Sold the first Ethernet switch, the EtherSwitch, in 1990.' },
    bbn: { name: 'BBN', owner: 'Raytheon BBN', what: 'Built the IMP, the first router, for the ARPANET in 1969.' },
    ieee: { name: 'IEEE', owner: 'IEEE', icon: 'ieee', what: 'Writes the 802 standards: Ethernet, Wi-Fi, VLAN tags, spanning tree.' },
    ietf: { name: 'IETF', owner: 'Internet Engineering Task Force', what: 'Writes the RFCs: IP, TCP, OSPF, DHCP and the rest.' },
    redhat: { name: 'Red Hat', owner: 'Red Hat, Inc.', icon: 'redhat', what: 'Owns Ansible.' },
    ansible: { name: 'Ansible', owner: 'Red Hat, Inc.', icon: 'ansible', what: 'Agentless automation over SSH, written in YAML.' },
    puppet: { name: 'Puppet', owner: 'Puppet (Perforce)', icon: 'puppet', what: 'Agent-based configuration management.' },
    chef: { name: 'Chef', owner: 'Progress Software', icon: 'chef', what: 'Agent-based configuration management, written in Ruby.' },
    terraform: { name: 'Terraform', owner: 'HashiCorp', icon: 'terraform', what: 'Infrastructure as code.' },
    docker: { name: 'Docker', owner: 'Docker, Inc.', icon: 'docker', what: 'Made containers everyday tools in 2013.' },
    kubernetes: { name: 'Kubernetes', owner: 'Cloud Native Computing Foundation', icon: 'kubernetes', what: 'Runs containers across many machines.' },
    vmware: { name: 'VMware', owner: 'Broadcom Inc.', icon: 'vmware', what: 'Brought virtual machines to the x86 PC in 1999.' },
    aws: { name: 'Amazon Web Services', owner: 'Amazon.com, Inc.', icon: 'amazonwebservices', what: 'Opened the public cloud in 2006.' },
    gcp: { name: 'Google Cloud', owner: 'Google LLC', icon: 'googlecloud', what: 'A public cloud.' },
    wireshark: { name: 'Wireshark', owner: 'the Wireshark Foundation', icon: 'wireshark', what: 'Shows every packet on the wire.' },
    json: { name: 'JSON', owner: 'ECMA International', icon: 'json', what: 'The data format with matching braces.' },
    vocaltec: { name: 'VocalTec', owner: 'VocalTec Communications (later magicJack VocalTec)', what: 'Sold InternetPhone in February 1995, the first commercial program for talking over the internet.' },
    mit: { name: 'MIT', owner: 'Massachusetts Institute of Technology', what: 'Where Abhay Bhushan wrote the first file transfer protocol, RFC 114, in 1971.' },
    cert: { name: 'CERT/CC', owner: 'Carnegie Mellon University (Software Engineering Institute)', what: 'The CERT Coordination Center, set up in November 1988 after the Morris worm: the first computer emergency response team.' }
  };
})();
