/* Stage 8 · The Lab — wireless, virtualization, automation. Framework stub: one intro level. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'lab', arc: 'grid', title: 'STAGE 8 · THE LAB', sub: 'wireless, virtualization, automation', npc: 'hypervisor', status: 'stub', levels: [
    { id: 'hyper-intro', title: 'Little instances', sub: 'Days 55–63 · virtualization, cloud, SDN, automation', npc: 'hypervisor', day: [55,56,57,60,61,62,63], src: [PS('Virtualizations_and_Cloud_Part1.md'), PS('Software_Defined_Networking.md'), PS('Ansible_Puppet_Chef.md')], unlocks: ['virtualization'],
      beats: [
        { k: 'SCENE', where: 'The Lab · a basement under the college · rows of humming machines',
          lines: [
            { who: 'narr', text: 'A woman in a lab coat with a grey bun and a black cat on her shoulder is talking to a rack as if it can hear her.' },
            { who: 'hypervisor', text: 'Oh, hello. Mind the cable. Every gig you run in this game happens in here, on one of my little instances. This one box runs forty of them. The software that does that is a [[hypervisor]]. Each instance is a whole computer with its own operating system. A [[virtual machine]].' },
            { who: 'you', text: 'Forty computers in one box?' },
            { who: 'hypervisor', text: 'Forty is nothing. And when a whole operating system is too much, a [[container]] shares the kernel with its neighbours and starts in a blink. When you jack in on a job and break something, you are breaking a snapshot. I put it back. Break it freely.' }
          ],
          choice: { opts: [
            { say: 'What is down the hall?', reply: '"Jason and Ansible. Jason speaks [[JSON]], which is what a [[REST API]] answers in. Ansible writes plays in [[YAML]] and pushes them to a thousand boxes over SSH without installing anything on them. Between them is a whiteboard that says control plane, data plane, management plane. That is [[SDN]]: pull the thinking into one controller and let the boxes just forward."' },
            { say: 'Is the cloud just this, somewhere else?', reply: '"It is this, somewhere else, rented by the hour. NIST wrote the definition in 2011: on demand, reached over the network, pooled, elastic, measured. Five words. Every vendor slide is those five words with a logo."' }
          ] } },
        { k: 'LORE', text: 'Prof. Hypervisor, feeding the cat: "IBM ran the first virtual machines on the CP-40 in 1967. VMware made it ordinary in 1998. Docker put containers in everyone\'s hands at a conference in March 2013. Ansible is from 2012, and it is named after the instant communicator in Ursula K. Le Guin\'s novels, which I think is the best name in the building."' },
        { k: 'KIT', text: 'A sticky note from the side of a monitor.', kit: [ { cmd: 'Type 1: ESXi, Hyper-V · Type 2: VirtualBox, Workstation', what: 'on bare metal, or on top of an OS' }, { cmd: '[[control plane]] · [[data plane]] · [[management plane]]', what: 'SDN separates the first from the second' }, { cmd: 'GET · POST · PUT · PATCH · DELETE', what: 'the REST verbs' } ] },
        { k: 'SYNC', q: { prompt: 'The professor, mid-thought: "Hypervisor on bare metal, no operating system underneath. Which type?"', opts: ['Type 1', 'Type 2', 'A container', 'A cloud'], a: 0, yes: '"Type 1. The cat knew that."', no: '"Type 1 sits on the metal. Type 2 sits on an operating system, like the one on your laptop."' } }
      ] }
  ] });
})();
