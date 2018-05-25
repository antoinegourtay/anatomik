const express = require('express'),
    router = express.Router(),
    isAuthentificated = require('./utils/isAuthentificated'),
    uuid = require('uuid/v4'),
    flash = require('connect-flash'),
    fs = require('fs'),
    path = require('path'),
    dir = path.join(__dirname, '..', 'project-folders'),
    getProject = require('./utils/getProject'),
    getPhases = require('./utils/getPhases'),
    getSubphases = require('./utils/getSubphases'),
    mkdirp = require('mkdirp'),
    isDirectory = source => fs.lstatSync(source).isDirectory(),
    formidable = require('formidable');

const User = require('../models/users'),
    Project = require('../models/project'),
    Folder = require('../models/folder'),
    Phase = require('../models/phases'),
    Subphase = require('../models/subphases'),
    Entreprise = require('../models/Entreprise');

/**
 * This function checks if a the element passed is in the array in argument
 * @param {*} array
 * @param {*} element
 */
const contains = function (array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
};

router.get('/ogp', isAuthentificated, (req, res) => {
    let user = usr;
    if (user.organizationType == "Association") {
        Project.find({
                isArchived: false,
                $or: [{
                        associationResponsible: user.id
                    },
                    {
                        users: user.id
                    },
                ]
            })
            .populate("projects")
            .populate('associationResponsible')
            .populate("users")
            .then(projects => {
                res.render('ogp/ogp-home', {
                    title: 'Anatomik - Projets',
                    user: req.user,
                    projects: projects
                });
            });
    } else {
        res.redirect('/');
    }
});

router.get('/ogp/create', isAuthentificated, (req, res) => {
    let user = usr;


    if (user.organizationType == "Association") {
        User.find({
                association: user.association

            })
            .populate("users")
            .then(users => {
                Entreprise.find({})
                    .then(entreprises => {
                        res.render('ogp/ogp-create', {
                            title: 'Anatomik - Créer un projet',
                            user: req.user,
                            associationUsers: users,
                            entreprises: entreprises
                        });
                    });
            });
    } else {
        res.redirect('/');
    }
});

/**
 * Project creation
 */
router.post('/ogp/create', isAuthentificated, (req, res) => {
    let user = usr;
    let err = [];
    let responsibleUsers = null;
    let projetUuid = uuid();
    let createdProjectId;
    let projectPhases = [];
    let projectUsers = [];

    let project = new Project();
    createdProjectId = project._id;

    let sY = (req.body.date_debut_submit).substring(0, 4);
    let sM = (req.body.date_debut_submit).substring(5, 7);
    let sD = (req.body.date_debut_submit).substring(8);

    let eY = (req.body.date_fin_submit).substring(0, 4);
    let eM = (req.body.date_fin_submit).substring(5, 7);
    let eD = (req.body.date_fin_submit).substring(8);

    let startDate = new Date(sY + "-" + sM + "-" + sD);
    let endDate = new Date(eY + "-" + eM + "-" + eD);

    if (user.organizationType == "Association") {

        if (endDate < startDate || endDate === startDate) {
            res.redirect('/ogp/create');

        } else {
            project.startDate = req.body.date_debut;
            project.endDate = req.body.date_fin;
        }

        let nUsers = [];
        nUsers.push(user.id);

        if (req.body.name != "") {
            project.name = req.body.name;
        } else {
            res.redirect('/ogp/create');
        }

        project.objective = req.body.objective;
        project.uuid = projetUuid;
        project.description = req.body.description;
        project.state = req.body.state;
        project.associationResponsible = req.body.associationResponsible;
        nUsers.push(req.body.associationResponsible);
        project.users = nUsers;
        project.provisionnalBudget = req.body.provisionnalbudget;

        project.save();

        mkdirp(dir + '/' + createdProjectId.toString(), err => {
            if (err) console.log(err);
        });

        for (let i = 0; i < req.body.etape.length; i++) {
            let newPhase = new Phase();
            let newPhaseId = newPhase._id;

            newPhase.name = req.body.etape[i].nom_phase;
            newPhase.description = req.body.etape[i].description_phase;
            if (req.body.etape[i].entreprise_select === undefined) {

            } else {
                newPhase.entreprise = req.body.etape[i].entreprise_select;
            }
            newPhase.project = createdProjectId;

            let sYp = (req.body.etape[i].date_debut_phase_submit).substring(0, 4);
            let sMp = (req.body.etape[i].date_debut_phase_submit).substring(5, 7);
            let sDp = (req.body.etape[i].date_debut_phase_submit).substring(8);

            let eYp = (req.body.etape[i].date_debut_phase_submit).substring(0, 4);
            let eMp = (req.body.etape[i].date_debut_phase_submit).substring(5, 7);
            let eDp = (req.body.etape[i].date_debut_phase_submit).substring(8);

            let startDateP = new Date(sYp + "-" + sMp + "-" + sDp);
            let endDateP = new Date(eYp + "-" + eMp + "-" + eDp);

            if (endDateP < startDateP) {
                res.redirect('/ogp/create');
            }
            if (endDateP === startDateP) {
                res.redirect('/ogp/create');

            }
            if (startDateP < startDate) {
                res.redirect('/ogp/create');

            }
            if (endDateP < startDate) {
                res.redirect('/ogp/create');

            }
            if (startDateP > endDate) {
                res.redirect('/ogp/create');

            }
            if (endDateP > endDate) {
                res.redirect('/ogp/create');


            }

            newPhase.startDatePhase = req.body.etape[i].date_debut_phase;
            newPhase.endDatePhase = req.body.etape[i].date_fin_phase;

            newPhase.save();

            mkdirp(dir + '/' + createdProjectId.toString() + "/" + newPhaseId.toString(), err => {
                if (err) console.log(err);
            });

            for (let j = 0; j < req.body.etape[i].sous_phase.length; j++) {
                let newSubPhase = new Subphase();
                let newSubPhaseId = newSubPhase._id;

                newSubPhase.name = req.body.etape[i].sous_phase[j].nom_sous_phase;

                if (req.body.etape[i].sous_phase[j].nom_sous_phase != "") {
                    newSubPhase.value = req.body.etape[i].sous_phase[j].prix_sous_phase;
                }

                newSubPhase.phase = newPhaseId;
                newSubPhase.project = createdProjectId;
                newSubPhase.state = "En cours";

                if (req.body.etape[i].sous_phase[j].nom_sous_phase != "") {
                    newSubPhase.save();
                }

            } // end loop for subphase

        } // End loop for phase

        res.redirect('/ogp');

    } else {
        res.render("/", {
            user: user
        });
    }
});


router.get('/ogp/:id_project', isAuthentificated, (req, res) => {
    let user = usr;
    let selectedProject;
    let projectPhasesIds = [];
    let projectPhases = [];
    let projectSubPhasesIds = [];
    let projectSubPhases = [];
    let phasesEntreprises = [];
    const projectId = req.params.id_project;
    let percentageOfProject;

    if (user.organizationType == "Association") {

        Project.findById(req.params.id_project)
            .populate("projects")
            .populate('associationResponsible')
            .populate("phases")
            .populate("subphases")
            .then(project => {
                selectedProject = project;
                projectPhases = selectedProject.phases;
                projectSubPhases = selectedProject.subphases;

                Subphase.find({
                    project: projectId,
                    $and: [{
                        state: 'Terminée'
                    }]
                }).then(subphases => {
                    percentageOfProject = Math.trunc(subphases.length / projectSubPhases.length * 100);
                });

                User.find({
                    association: project.associationResponsible.association
                }).then(users => {

                    for (let i = 0; i < projectPhases.length; i++) {
                        Entreprise.findById(projectPhases[i].entreprise)
                            .populate("entreprise")
                            .populate("phases")
                            .then(entreprise => {
                                phasesEntreprises.push(entreprise);

                            });
                        setTimeout(() => {
                            res.render('ogp/ogp-single-project', {
                                title: 'Anatomik - ' + project.name,
                                users: users,
                                user: user,
                                projectUsers: project.users,
                                project: selectedProject,
                                phases: projectPhases.reverse(),
                                subphases: projectSubPhases,
                                entreprises: phasesEntreprises,
                                subphasesPrice: 0,
                                phasesPrice: 0,
                                percentageOfProject: percentageOfProject
                            });
                        }, 2000);
                    }
                });
            });

    } else {
        res.redirect('/');
    }
});

router.get('/ogp/edit/:id_project', isAuthentificated, (req, res) => {
    let user = usr;

    if (user.organizationType == "Association") {
        Project.findById(req.params.id_project)
            .populate("projects").populate('phases').populate('subphases')
            .then(project => {
                User.find({
                        association: user.association
                    })
                    .populate("users")
                    .then(users => {
                        Entreprise.find({
                                is_archive: false
                            })
                            .then(entreprises => {
                                res.render('ogp/ogp-edit', {
                                    title: 'Anatomik - Editer ' + project.name,
                                    user: user,
                                    project: project,
                                    phases: project.phases,
                                    subphases: project.subphases,
                                    associationUsers: users,
                                    entreprises: entreprises
                                });
                            });
                    });
            });
    } else {
        res.redirect('/');
    }


});


router.get('/ogp/delete/:id_project', (req, res) => {
    Project.findById(req.params.id_project).then(project => {
        project.isArchived = true;
        project.save();
    });
});

/**
 * Project edition
 */
router.post('/ogp/edit/:id_project', isAuthentificated, (req, res) => {
    let user = usr;
    let err = [];
    let responsibleUsers = null;
    let projetUuid = uuid();
    let projectId = req.params.id_project;
    let projectPhases = [];
    let creadtedProject;



    let sY = (req.body.date_debut_submit).substring(0, 4);
    let sM = (req.body.date_debut_submit).substring(5, 7);
    let sD = (req.body.date_debut_submit).substring(8);

    let eY = (req.body.date_fin_submit).substring(0, 4);
    let eM = (req.body.date_fin_submit).substring(5, 7);
    let eD = (req.body.date_fin_submit).substring(8);

    let startDate = new Date(sY + "-" + sM + "-" + sD);
    let endDate = new Date(eY + "-" + eM + "-" + eD);

    /**
     * Variables for deletion in tables
     */
    let subphasesInForm = [];
    let phasesInForm = [];

    if (user.organizationType == "Anatomik" || user.organizationType == "Association") {
        Project.findById(projectId)
            .populate("projects")
            .then(project => {

                if (endDate < startDate || endDate === startDate) {
                    res.redirect('/ogp/edit/' + projectId);
                } else {
                    let nUsers = [];
                    nUsers.push(user.id);
                    if (req.body.name) {
                        project.name = req.body.name;
                    } else {
                        res.redirect('/ogp/edit/' + projectId);
                    }

                    project.startDate = req.body.date_debut;
                    project.endDate = req.body.date_fin;

                    project.objective = req.body.objective;
                    project.uuid = projetUuid;
                    project.description = req.body.description;
                    project.associationResponsible = user.id;
                    project.users = nUsers;
                    project.provisionnalBudget = req.body.provisionnalbudget;

                    if (req.body.state == "") {
                        project.state = project.state;
                    } else {
                        project.state = req.body.state;

                    }

                    creadtedProject = project;
                    project.save();

                }

            });

        for (let i = 0; i < req.body.etape.length; i++) {
            let createdPhaseId;

            let sYp = (req.body.etape[i].date_debut_phase_submit).substring(0, 4);
            let sMp = (req.body.etape[i].date_debut_phase_submit).substring(5, 7);
            let sDp = (req.body.etape[i].date_debut_phase_submit).substring(8);

            let eYp = (req.body.etape[i].date_debut_phase_submit).substring(0, 4);
            let eMp = (req.body.etape[i].date_debut_phase_submit).substring(5, 7);
            let eDp = (req.body.etape[i].date_debut_phase_submit).substring(8);

            let startDateP = new Date(sYp + "-" + sMp + "-" + sDp);
            let endDateP = new Date(eYp + "-" + eMp + "-" + eDp);

            if (req.body.etape[i].id_phase == "") {
                let newPhase = new Phase();

                createdPhaseId = newPhase._id;

                newPhase.name = req.body.etape[i].nom_phase;
                newPhase.description = req.body.etape[i].description_phase;

                if (endDateP < startDateP) {
                    res.redirect('/ogp/edit/' + projectId);
                }
                if (endDateP === startDateP) {
                    res.redirect('/ogp/edit/' + projectId);
                }
                if (startDateP < startDate) {
                    res.redirect('/ogp/edit/' + projectId);
                }
                if (endDateP < startDate) {
                    res.redirect('/ogp/edit/' + projectId);
                }
                if (startDateP > endDate) {
                    res.redirect('/ogp/edit/' + projectId);
                }
                if (endDateP > endDate) {
                    res.redirect('/ogp/edit/' + projectId);
                }

                newPhase.startDatePhase = req.body.etape[i].date_debut_phase;
                newPhase.endDatePhase = req.body.etape[i].date_fin_phase;
                newPhase.project = projectId;
                if (req.body.etape[i].entreprise_select === undefined) {

                } else {
                    newPhase.entreprise = req.body.etape[i].entreprise_select;
                }

                mkdirp(dir + "/" + projectId.toString() + "/" + newPhase._id.toString(), '777', err => {
                    if (err) console.log(err);
                });

                phasesInForm.push(newPhase._id.toString());
                newPhase.save();

                if (req.body.etape[i].sous_phase) {
                    for (let j = 0; j < req.body.etape[i].sous_phase.length; j++) {

                        if (req.body.etape[i].sous_phase[j].id_sous_phase != '') {
                            Subphase.findById(req.body.etape[i].sous_phase[j].id_sous_phase)
                                .then(subphase => {

                                    subphase.name = req.body.etape[i].sous_phase[j].nom_sous_phase;
                                    if (req.body.etape[i].sous_phase[j].nom_sous_phase != "" && req.body.etape[i].sous_phase[j].prix_sous_phase == "") {
                                        res.redirect('/ogp/edit/' + projectId);
                                    } else {
                                        subphase.value = req.body.etape[i].sous_phase[j].prix_sous_phase;
                                    }
                                    subphase.project = projectId;
                                    if (req.body.etape[i].sous_phase[j].sous_phase_state === undefined) {

                                    } else {
                                        subphase.state = req.body.etape[i].sous_phase[j].sous_phase_state;
                                    }

                                    subphasesInForm.push(subphase._id.toString());
                                    subphase.save();

                                });
                        } else if (req.body.etape[i].sous_phase[j].id_sous_phase === '' && req.body.etape[i].sous_phase[j].nom_sous_phase != '') {
                            let newSubPhase = new Subphase();

                            newSubPhase.name = req.body.etape[i].sous_phase[j].nom_sous_phase;
                            if (req.body.etape[i].sous_phase[j].nom_sous_phase != "" && !req.body.etape[i].sous_phase[j].prix_sous_phase) {
                                res.redirect('/ogp/edit/' + projectId);
                            } else {
                                newSubPhase.value = req.body.etape[i].sous_phase[j].prix_sous_phase;
                            }
                            newSubPhase.phase = createdPhaseId;
                            newSubPhase.project = projectId;
                            newSubPhase.state = req.body.etape[i].sous_phase[j].sous_phase_state;

                            subphasesInForm.push(newSubPhase._id.toString());

                            newSubPhase.save((err) => {
                                if (err) console.log(err);
                            });
                        } else {

                        }
                    } // end loop for subbphase
                }

                //If there is already a phase registered
            } else {
                Phase.findById(req.body.etape[i].id_phase)
                    .then(phase => {
                        createdPhaseId = req.body.etape[i].id_phase;

                        phase.name = req.body.etape[i].nom_phase;
                        phase.description = req.body.etape[i].description_phase;

                        if (endDateP < startDateP) {
                            res.redirect('/ogp/edit/' + projectId);
                        }
                        if (endDateP === startDateP) {
                            res.redirect('/ogp/edit/' + projectId);
                        }
                        if (startDateP < startDate) {
                            res.redirect('/ogp/edit/' + projectId);
                        }
                        if (endDateP < startDate) {
                            res.redirect('/ogp/edit/' + projectId);
                        }
                        if (startDateP > endDate) {
                            res.redirect('/ogp/edit/' + projectId);
                        }
                        if (endDateP > endDate) {
                            res.redirect('/ogp/edit/' + projectId);
                        }

                        phase.startDatePhase = req.body.etape[i].date_debut_phase;
                        phase.endDatePhase = req.body.etape[i].date_fin_phase;
                        if (req.body.etape[i].entreprise_select === undefined) {

                        } else {
                            phase.entreprise = req.body.etape[i].entreprise_select;
                        }

                        phasesInForm.push(phase._id.toString());
                        phase.save();

                        if (req.body.etape[i].sous_phase) {
                            for (let j = 0; j < req.body.etape[i].sous_phase.length; j++) {

                                if (req.body.etape[i].sous_phase[j].id_sous_phase != '') {
                                    Subphase.findById(req.body.etape[i].sous_phase[j].id_sous_phase)
                                        .then(subphase => {

                                            subphase.name = req.body.etape[i].sous_phase[j].nom_sous_phase;
                                            if (req.body.etape[i].sous_phase[j].nom_sous_phase != "" && req.body.etape[i].sous_phase[j].prix_sous_phase == "") {
                                                res.redirect('/ogp/edit/' + projectId);
                                            } else {
                                                subphase.value = req.body.etape[i].sous_phase[j].prix_sous_phase;
                                            }
                                            subphase.project = projectId;
                                            if (req.body.etape[i].sous_phase[j].sous_phase_state === undefined) {

                                            } else {
                                                subphase.state = req.body.etape[i].sous_phase[j].sous_phase_state;
                                            }

                                            subphasesInForm.push(subphase._id.toString());
                                            subphase.save();

                                        });
                                } else if (req.body.etape[i].sous_phase[j].id_sous_phase === '' && req.body.etape[i].sous_phase[j].nom_sous_phase != '') {
                                    let newSubPhase = new Subphase();

                                    newSubPhase.name = req.body.etape[i].sous_phase[j].nom_sous_phase;
                                    if (req.body.etape[i].sous_phase[j].nom_sous_phase != "" && !req.body.etape[i].sous_phase[j].prix_sous_phase) {
                                        res.redirect('/ogp/edit/' + projectId);
                                    } else {
                                        newSubPhase.value = req.body.etape[i].sous_phase[j].prix_sous_phase;
                                    }
                                    newSubPhase.phase = createdPhaseId;
                                    newSubPhase.project = projectId;
                                    newSubPhase.state = req.body.etape[i].sous_phase[j].sous_phase_state;

                                    subphasesInForm.push(newSubPhase._id.toString());

                                    newSubPhase.save((err) => {
                                        if (err) console.log(err);
                                    });
                                } else {

                                }
                            } // end loop for subbphase

                            Project.findById(req.params.id_project)
                                .populate("projects")
                                .populate("phases")
                                .populate("subphases")
                                .then(selectedProject => {
                                    let phasesInProject = selectedProject.phases;
                                    let subphasesInProject = selectedProject.subphases;


                                    for (let y = 0; y < subphasesInProject.length; y++) {
                                        if (!contains(subphasesInForm, subphasesInProject[y]._id.toString())) {
                                            Subphase.findByIdAndRemove(subphasesInProject[y]._id, (err, subphase) => {
                                                if (err) console.log(err);
                                            });
                                        }
                                    }

                                    for (let z = 0; z < phasesInProject.length; z++) {
                                        if (!contains(phasesInForm, phasesInProject[z]._id.toString())) {
                                            Phase.findByIdAndRemove(phasesInProject[z]._id, (err, phase) => {
                                                if (err) console.log(err);
                                            });
                                        }
                                    }
                                    return;
                                }).then(() => {
                                    res.redirect('/ogp/' + projectId);
                                });
                        }

                    });
            }
            //Adding or updating subphase
        } //end loop for phase
    } else {
        res.render("/", {
            user: user
        });
    }

});

/**
 * Get documents for a project
 */
router.get('/ogp/documents/:id_project', isAuthentificated, (req, res) => {
    const idProject = req.params.id_project;
    const user = usr;
    const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString() + '/');

    let files = [];
    let filesInEachPhases = [];

    if (user.organizationType == "Association") {
        Project.findById(idProject).populate('phases').populate('subphases').then(project => {
            let phases = project.phases;
            let subphases = project.subphases;

            for (let i = 0; i < phases.length; i++) {
                let count = 0;
                const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString(), phases[i].id.toString());

                fs.readdirSync(folderPath).forEach(file => {
                    if (!fs.lstatSync(folderPath + '/' + file).isDirectory()) {
                        count += 1;
                    }
                });

                filesInEachPhases.push(count);
            }

            const projectPath = path.join(__dirname, '..', 'project-folders', idProject.toString());

            fs.readdirSync(projectPath).forEach(file => {
                if (!fs.lstatSync(folderPath + '/' + file).isDirectory()) {
                    files.push(file);
                }
            });



            res.render('ogp/ogp-documents', {
                title: 'Anatomik - Documents ' + project.name,
                user: user,
                project: project,
                phases: phases,
                subphases: subphases,
                files: files,
                projectId: idProject,
                filesInEachPhases: filesInEachPhases
            });
        });
    } else {
        res.redirect('/');
    }
});

/**
 * Get documents for a specific phase
 */
router.get('/ogp/documents/:id_project/:id_phase', isAuthentificated, (req, res) => {
    const idProject = req.params.id_project;
    const idPhase = req.params.id_phase;
    const user = usr;
    const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString() + '/' + idPhase.toString() + '/');

    let files = [];
    let filesInPhase;

    if (user.organizationType == "Association") {
        Project.findById(idProject).populate('phases').populate('subphases').then(project => {
            let phases = project.phases;
            let subphases = project.subphases;

            let count = 0;
            const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString(), idPhase.toString());

            fs.readdirSync(folderPath).forEach(file => {
                if (!fs.lstatSync(folderPath + '/' + file).isDirectory()) {
                    files.push(file);
                    count += 1;
                }
            });
            filesInPhase = count;

            Phase.findById(idPhase).then(phase => {
                res.render('ogp/ogp-documents-phase', {
                    title: 'Anatomik - Documents ' + project.name,
                    user: user,
                    project: project,
                    phases: phases,
                    phase: phase,
                    subphases: subphases,
                    files: files,
                    phaseId: idPhase,
                    projectId: idProject,
                    filesInPhase: filesInPhase
                });
            });
        });
    } else {
        res.redirect('/');
    }
});


router.post('/ogp/add_members/:id_project?', isAuthentificated, (req, res) => {
    const user = usr;

    if (user.organizationType == "Association") {
        Project.findById(req.params.id_project)
            .populate("projects")
            .populate('associationResponsible')
            .populate("phases")
            .populate("subphases")
            .populate('users')
            .then(project => {
                project.users = req.body.users

                return project.save();
            })
            .then(() => {
                res.redirect("/ogp/" + req.params.id_project);
            });
    } else {
        res.redirect('/');
    }
});

// Delete member in project
router.get('/ogp/delete_member/:id_projetct/:id_member', isAuthentificated, (req, res) => {
    let idProject = req.params.id_projetct;
    let idMember = req.params.id_member;

    const user = usr;

    if (user.organizationType == "Association") {

        Project.findById(idProject).then(project => {
            let index = project.users.indexOf(idMember);
            if (index > -1) {
                project.users.splice(index, 1);
                return project.save();
            }
        }).then(() => {
            res.redirect("/ogp/" + idProject);
        });
    } else {
        res.redirect('/');
    }
});

/**
 * Uploading documents for projects
 */
router.post('/ogp/documents/:id_project', isAuthentificated, (req, res) => {
    const user = usr;

    let idProject = req.params.id_project;
    let form = new formidable.IncomingForm();
    const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString());

    if (user.organizationType == "Association") {
        form.parse(req);

        form.on('fileBegin', (name, file) => {
            file.path = path.join(folderPath, file.name);
        });

        form.on('file', (name, file) => {
            res.redirect('/ogp/documents/' + idProject.toString());

        });

    } else {
        res.redirect('/');
    }

});

/**
 * Uploading documents for phases
 */
router.post('/ogp/documents/:id_project/:id_phase', isAuthentificated, (req, res) => {
    const idProject = req.params.id_project;
    const idPhase = req.params.id_phase;
    const folderPath = path.join(__dirname, '..', 'project-folders', idProject.toString() + '/' + idPhase.toString() + '/');
    let form = new formidable.IncomingForm();
    const user = usr;

    if (user.organizationType == "Association") {

        form.parse(req);

        form.on('fileBegin', (name, file) => {
            file.path = path.join(folderPath, file.name);
        });

        form.on('file', (name, file) => {
            res.redirect('/ogp/documents/' + idProject.toString() + '/' + idPhase.toString());
        });

    } else {
        res.redirect('/');
    }
});

router.get('/ogp/archive/:idProject', isAuthentificated, (req, res) => {
    const user = usr;

    if (user.organizationType == "Association") {
        Project.findById(req.params.idProject)
            .then(project => {
                project.isArchived = true;
                project.save((err) => {
                    if (err) console.log(err);
                    else res.redirect('/ogp');
                });

            });
    } else {
        res.redirect('/');
    }

});


router.get('/ogp/delete-file/:idProject/:idPhase/:filename', isAuthentificated, (req, res) => {
    let user = usr;
    let idProject = req.params.idProject;
    let idPhase = req.params.idPhase;
    let filename = req.params.filename;

    if (user.organizationType == "Association") {
        let pathToFile = path.join(__dirname, '..', 'project-folders', idProject.toString(), idPhase.toString(), filename);

        fs.unlinkSync(pathToFile);
        res.redirect('/ogp/documents/' + idProject + '/' + idPhase);

    } else {
        res.redirect('/');
    }
});


router.get('/ogp/delete-file/:idProject/:filename', isAuthentificated, (req, res) => {
    let user = usr;
    let idProject = req.params.idProject;
    let filename = req.params.filename;

    if (user.organizationType == "Association") {
        let pathToFile = path.join(__dirname, '..', 'project-folders', idProject.toString(), filename);

        fs.unlinkSync(pathToFile);
        res.redirect('/ogp/documents/' + idProject);
    } else {
        res.redirect('/');
    }
});

module.exports = router;